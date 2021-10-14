import {
  DIDDocument,
  DIDDocumentUnsinged,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION
} from "@owlmeans/regov-ssi-did"
import { identityHelper } from "../identity/identity"
import {
  CredentialSubject,
  Credential,
  WrappedDocument,
  BASE_CREDENTIAL_TYPE,
  UnsignedCredential,
  UnsignedPresentation,
  Presentation,
  ContextSchema,
  WalletWrapper,
  KeyPair,
  CredentialWrapper,
  REGISTRY_SECTION_PEER,
  REGISTRY_TYPE_CLAIMS,
  REGISTRY_TYPE_CREDENTIALS,
  REGISTRY_TYPE_IDENTITIES,
  REGISTRY_SECTION_OWN
} from "@owlmeans/regov-ssi-core"
import {
  ClaimSubject,
  ClaimCredential,
  CREDENTIAL_CLAIM_TYPE,
  ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL,
  ClaimBundle,
  CLAIM_TYPE_PREFIX,
  ClaimExtenstion,
  ClaimPayload,
  ERROR_UNTRUSTED_ISSUER,
  ERROR_NO_RELATED_DID_FOUND,
  ERROR_CLAIM_OFFER_DONT_MATCH,
  CREDENTIAL_RESPONSE_TYPE,
  CREDENTIAL_SATELLITE_TYPE,
  SatelliteCredential,
  HolderVisitor,
  ERROR_WRONG_CLAIM_SUBJECT_TYPE
} from "./types"
import {
  CREDENTIAL_OFFER_TYPE,
  OfferBundle,
  OfferCredential,
  OfferSubject
} from "../issuer/types"
import { EntityIdentity, IdentityParams } from "../identity/types"
import { CREDENTIAL_REQUEST_TYPE, RequestBundle, RequestCredential } from "../verifier/types"
import { SatelliteSubject } from "."


export const isSatellite = (crednetial: Credential): crednetial is SatelliteCredential => {
  return crednetial.type.includes(CREDENTIAL_SATELLITE_TYPE)
}

export const holderCredentialHelper = <
  Payload extends {} = {},
  Extension extends {} = {},
  CredentialT extends Credential<CredentialSubject<WrappedDocument<Payload>, Extension>>
  = Credential<CredentialSubject<WrappedDocument<Payload>, Extension>>,
  VisitorExtension extends {} = {}
>(wallet: WalletWrapper, visitor?: HolderVisitor<CredentialT, VisitorExtension>) => {
  type SubjectUT = CredentialT extends Credential<infer Subject> ? Subject : never
  type CredentialUT = UnsignedCredential<SubjectUT>
  const _identityHelper = identityHelper(wallet)

  return {
    claim: (
      claimOptions: {
        type: string | string[],
        schemaUri?: string,
        crdContext?: ContextSchema,
        holder?: DIDDocument,
      }
    ) => {
      return {
        build: async (payload: Payload, options?: {
          key?: KeyPair | string,
          extension?: Extension,
          didUnsigned?: DIDDocumentUnsinged
        }) => {
          const credentialSubject = {
            data: {
              '@type': claimOptions.type,
              ...payload
            },
            ...(options?.extension ? options?.extension : {})
          }

          const key = await wallet.keys.getCryptoKey(options?.key)
          const didUnsigned = options?.didUnsigned || await wallet.did.helper().createDID(
            key,
            {
              data: JSON.stringify(credentialSubject),
              hash: true,
              purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_AUTHENTICATION]
            }
          )

          const holder = claimOptions.holder || _identityHelper.getIdentity().did
          if (!holder) {
            throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
          }

          const types = Array.isArray(claimOptions.type) ? claimOptions.type : [claimOptions.type]

          const unsignedCredential = await wallet.ssi.buildCredential<
            WrappedDocument<Payload>,
            CredentialSubject<WrappedDocument<Payload>, Extension>
          >({
            id: didUnsigned.id,
            type: [BASE_CREDENTIAL_TYPE, ...types],
            holder: wallet.did.helper().extractProofController(holder),
            context: wallet.ssi.buildContext(
              claimOptions.schemaUri || types.join('/').toLowerCase(),
              claimOptions.crdContext
            ),
            subject: credentialSubject
          }) as CredentialUT

          const claimSubject: ClaimSubject<CredentialUT> = {
            data: {
              '@type': `${CLAIM_TYPE_PREFIX}:${types[types.length - 1]}`,
              credential: unsignedCredential
            },
            did: didUnsigned
          }

          const claimUnsigned = await wallet.ssi.buildCredential<
            WrappedDocument<{ credential: CredentialUT }>,
            ClaimSubject<CredentialUT>
          >({
            id: didUnsigned.id,
            type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_CLAIM_TYPE],
            holder: wallet.did.helper().extractProofController(holder),
            subject: claimSubject,
            context: wallet.ssi.buildContext(
              'credential/claim',
              /**
               * @TODO Proper context description required
               */
              {
                did: { '@id': 'scm:did', '@type': '@json' },
                credential: { '@id': 'scm:credential', '@type': '@json' }
              }
            )
          })

          return await wallet.ssi.signCredential(
            claimUnsigned,
            holder
          ) as ClaimCredential<ClaimSubject<CredentialUT>>
        },

        /**
         * @TODO Allow to clean up registered claim
         */
        register: async (
          bundle: ClaimBundle<ClaimCredential<ClaimSubject<CredentialUT>>>
        ) => {
          await wallet.getRegistry(REGISTRY_TYPE_CLAIMS)
            .addCredential<
              CredentialSubject<WrappedDocument<Payload>, Extension>,
              Presentation<ClaimCredential<ClaimSubject<CredentialUT>>>
            >(bundle)
        }
      }
    },

    bundle: <
      BundledClaim extends ClaimCredential<
        ClaimSubject<CredentialUT, VisitorExtension>
      > = ClaimCredential<ClaimSubject<CredentialUT, VisitorExtension>>,
      BundledOffer extends OfferCredential<
        OfferSubject<CredentialT, VisitorExtension>
      > = OfferCredential<OfferSubject<CredentialT, VisitorExtension>>
    >(bundleOptions?: { holder?: DIDDocument }) => ({
      build: async (
        claims: BundledClaim[],
        identity?: IdentityParams | EntityIdentity | boolean
      ) => {
        claims = [...claims]
        await _identityHelper.attachEntity(claims, identity)
        const holder = bundleOptions?.holder || _identityHelper.getIdentity().did
        if (!holder) {
          throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
        }

        const unsigned = await wallet.ssi.buildPresentation(claims, {
          holder: holder.id,
          type: CREDENTIAL_CLAIM_TYPE
        }) as UnsignedPresentation<BundledClaim>

        return await wallet.ssi.signPresentation(unsigned, holder) as ClaimBundle<BundledClaim>
      },

      unbudle: async (bundle: OfferBundle<BundledOffer>) => {
        const offers = [...bundle.verifiableCredential]
        const entity = _identityHelper.extractEntity(offers)

        const did = entity?.credentialSubject.did
        if (!did || !await wallet.did.helper().verifyDID(did)) {
          throw new Error(ERROR_UNTRUSTED_ISSUER)
        }

        /**
         * @TODO we should be able to deal with untrusted issuer.
         * 
         * !!! In this case the initial claim should be addressed to a specific issuer.
         */
        let issuer = await wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential(
          bundle.holder.id, REGISTRY_SECTION_PEER
        )

        const substituteIssuer = visitor?.bundle?.unbundle?.updateIssuer
          && await visitor.bundle.unbundle.updateIssuer(bundle, bundle.holder.id)

        issuer = substituteIssuer || issuer

        if (!issuer) {
          throw new Error(ERROR_UNTRUSTED_ISSUER)
        }

        let issuerDid = await wallet.did.lookUpDid<DIDDocument>(issuer.credential.holder.id)
        if (substituteIssuer && visitor?.bundle?.unbundle?.updateDid) {
          issuerDid = await visitor.bundle.unbundle.updateDid(
            bundle, substituteIssuer.credential.id
          )
        }

        if (!issuerDid) {
          throw new Error(ERROR_NO_RELATED_DID_FOUND)
        }

        let result = visitor?.bundle?.unbundle?.verifyHolder
          ? await visitor.bundle.unbundle.verifyHolder(bundle, issuerDid)
          : true

        if (result) {
          const [verificationResult] = await wallet.ssi.verifyPresentation(bundle, issuerDid)
          result = verificationResult
        }

        result = result && bundle.type.includes(CREDENTIAL_OFFER_TYPE)

        type PayloadT = ClaimPayload<BundledClaim>
        type ExtensionT = ClaimExtenstion<BundledClaim>

        const claims = wallet.getRegistry(REGISTRY_TYPE_CLAIMS).getCredential<
          CredentialSubject<WrappedDocument<PayloadT>, ExtensionT>,
          Presentation<ClaimCredential<ClaimSubject<CredentialUT>>>
        >(bundle.id)

        if (result && claims) {
          result = false
          if (claims.credential.verifiableCredential.length
            === bundle.verifiableCredential.length) {
            const offers = bundle.verifiableCredential.map(
              offer => offer.credentialSubject.data.credential.id
            )
            result = claims.credential.verifiableCredential.some(
              claim => !offers.includes(claim.credentialSubject.data.credential.id)
            )
          }
          if (!result) {
            console.log(ERROR_CLAIM_OFFER_DONT_MATCH)
          }
        }

        return { result, offers, entity } as {
          result: boolean,
          offers: BundledOffer[],
          entity: EntityIdentity | undefined
        }
      },

      cleanup: async (response: OfferBundle<BundledOffer>) => {
        type PayloadT = ClaimPayload<BundledClaim>
        type ExtensionT = ClaimExtenstion<BundledClaim>
        type SubjectT = CredentialSubject<WrappedDocument<PayloadT>, ExtensionT>
        const claim = wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)
          .getCredential<SubjectT, ClaimBundle<BundledOffer>>(response.id)
        if (claim) {
          return await wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)
            .removeCredential(claim.credential)
        }
      },

      store: async (bundle: OfferBundle<BundledOffer>) => {
        const offers = [...bundle.verifiableCredential]
        await _identityHelper.extractEntity(offers)
        
        return Promise.all(offers.map(
          async (offer) => {
            wallet.did.addDID(offer.credentialSubject.did)
            visitor?.bundle?.store?.storeOffer
              && await visitor?.bundle?.store?.storeOffer(offer)

              const registryCode = visitor?.bundle?.store?.castRegistry
              ? visitor.bundle.store.castRegistry(offer)
              : REGISTRY_TYPE_CREDENTIALS
              const registry = wallet.getRegistry(registryCode)

            return await registry.addCredential<
              CredentialSubject<WrappedDocument<Payload>, Extension>,
              CredentialT
            >(offer.credentialSubject.data.credential)
          }
        ))
      }
    }),

    request: () => ({
      unbundle: async (bundle: RequestBundle) => {
        const requests = [...bundle.verifiableCredential]
        const entity = _identityHelper.extractEntity(requests)

        const did = entity?.credentialSubject.did
        if (!did || !await wallet.did.helper().verifyDID(did)) {
          throw new Error(ERROR_UNTRUSTED_ISSUER)
        }

        let [result] = await wallet.ssi.verifyPresentation(bundle, did)

        result = result && bundle.type.includes(CREDENTIAL_REQUEST_TYPE)

        return { result, requests, entity }
      },

      /**
       * @TODO Remove unnecessay verify methods, because it's part of unbandeling
       */
      verify: async (bundle: RequestBundle) => {
        const credentials = [...bundle.verifiableCredential]
        const identity = await _identityHelper.extractEntity(credentials)
        const did = identity?.credentialSubject.did
        if (!did) {
          throw new Error(ERROR_UNTRUSTED_ISSUER)
        }

        return await wallet.ssi.verifyPresentation(bundle, did)
      }
    }),

    response: ({ holder, identity }: {
      holder?: DIDDocument,
      identity?: IdentityParams | EntityIdentity | boolean
    } = {}) => ({
      build: async (
        requests: RequestCredential[] = [],
        requestBundle?: RequestBundle
      ) => {

        const wraps = await requests.reduce(
          async (accum, { credentialSubject: { data: req } }) => {
            const wraps = await wallet.getRegistry(req.source || REGISTRY_TYPE_CREDENTIALS)
              .lookupCredentials(req["@type"])
            return [...await accum, ...wraps.filter(
              ({ credential }) => [credential.holder.id, undefined].includes(req.holder)
                && [credential.issuer, undefined].includes(req.issuer?.id)
              /**
               * @TODO filter by issuer capabilties
               */
            )]
          }, Promise.resolve([] as CredentialWrapper[])
        )

        const responses: (Credential | SatelliteCredential)[] = []

        const entity = await _identityHelper.attachEntity(responses, identity)

        holder = holder || entity || _identityHelper.getIdentity().did
        if (!holder) {
          throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
        }

        (await Promise.all(wraps.map(
          async (wrap) => {
            if (!holder) {
              throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
            }
            const did = await wallet.did.lookUpDid<DIDDocument>(wrap.credential.id)
            if (!did) {
              throw Error(ERROR_NO_RELATED_DID_FOUND)
            }

            const satelliteSubject = {
              data: {
                '@type': CREDENTIAL_SATELLITE_TYPE,
                did
              }
            }

            const unsignedSatellite = await wallet.ssi.buildCredential({
              id: did.id,
              type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_SATELLITE_TYPE],
              holder: holder.id,
              subject: satelliteSubject,
              context: wallet.ssi.buildContext(
                'credential/satellite',
                { did: { '@id': 'scm:did', '@type': '@json' } }
              )
            }) as UnsignedCredential<SatelliteSubject<VisitorExtension>>

            visitor?.bundle?.response?.build?.createSatellite
              && visitor.bundle.response.build.createSatellite(
                unsignedSatellite,
                wrap.credential as CredentialT
              )

            const satellite = await wallet.ssi.signCredential(
              unsignedSatellite,
              holder
            )

            return [wrap.credential, satellite]
          }
        ))).flat(1).map(cred => responses.push(cred))

        const unsignedPresentation = await wallet.ssi.buildPresentation(
          responses, {
          id: requestBundle?.id,
          holder: holder.id,
          type: CREDENTIAL_RESPONSE_TYPE
        })

        return await wallet.ssi.signPresentation(unsignedPresentation, holder, {
          challange: requestBundle?.proof.challenge,
          domain: requestBundle?.proof.domain
        }) as Presentation<EntityIdentity | CredentialT>
      }
    })
  }
}