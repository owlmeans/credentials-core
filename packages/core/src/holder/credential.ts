import {
  DIDDocument,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION
} from "@owlmeans/regov-ssi-did"
import { identityHelper } from "../wallet/identity"
import {
  CredentialSubject,
  Credential,
  WrappedDocument,
  BASE_CREDENTIAL_TYPE,
  UnsignedCredential,
  UnsignedPresentation,
  Presentation,
  ContextSchema
} from "../credential/types"
import { WalletWrapper } from "../wallet/types"
import { KeyPair } from "../keys/types"
import {
  ClaimSubject,
  ClaimCredential,
  CREDENTIAL_CLAIM_TYPE,
  ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL,
  ClaimBundle,
  CLAIM_TYPE_PREFFIX,
  ClaimExtenstion,
  ClaimPayload,
  ERROR_UNTRUSTED_ISSUER,
  ERROR_NO_RELATED_DID_FOUND,
  ERROR_CLAIM_OFFER_DONT_MATCH
} from "./types"
import {
  CREDENTIAL_OFFER_TYPE,
  OfferBundle,
  OfferCredential
} from "../issuer/types"
import {
  CredentialWrapper,
  REGISTRY_SECTION_PEER,
  REGISTRY_TYPE_CLAIMS,
  REGISTRY_TYPE_CREDENTIALS,
  REGISTRY_TYPE_IDENTITIES
} from "../wallet/registry/types"
import { EntityIdentity, IdentityParams } from "../wallet/identity/types"
import { RequestBundle, RequestCredential } from ".."
import { CREDENTIAL_RESPONSE_TYPE, CREDENTIAL_SATELLITE_TYPE, SatelliteCredential } from "."


export const isSatellite = (crednetial: Credential): crednetial is SatelliteCredential => {
  return crednetial.type.includes(CREDENTIAL_SATELLITE_TYPE)
}

export const holderCredentialHelper = (wallet: WalletWrapper) => {
  const _identityHelper = identityHelper(wallet)

  return {
    claim: <
      Payload extends {} = {},
      Extension extends {} = {},
      CredentialUT extends UnsignedCredential<
        CredentialSubject<WrappedDocument<Payload>, Extension>
      > = UnsignedCredential<
        CredentialSubject<WrappedDocument<Payload>, Extension>
      >
    >(
      claimOptions: {
        type: string,
        schemaUri?: string,
        crdContext?: ContextSchema,
        holder?: DIDDocument,
      }
    ) => ({
      build: async (payload: Payload, options?: {
        key?: KeyPair | string,
        extension?: Extension
      }) => {
        const credentialSubject = {
          data: {
            '@type': claimOptions.type,
            ...payload
          }
        }

        const key = await wallet.keys.getCryptoKey(options?.key)
        const didUnsigned = await wallet.did.helper().createDID(
          key,
          {
            data: JSON.stringify(credentialSubject),
            hash: true,
            purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
          }
        )

        const holder = claimOptions.holder || _identityHelper.getIdentity().did
        if (!holder) {
          throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
        }

        const unsignedCredential = await wallet.ctx.buildCredential<
          WrappedDocument<Payload>,
          CredentialSubject<WrappedDocument<Payload>, Extension>
        >({
          id: didUnsigned.id,
          type: [BASE_CREDENTIAL_TYPE, claimOptions.type],
          holder: wallet.did.helper().extractProofController(holder),
          context: wallet.ctx.buildLDContext(
            claimOptions.schemaUri || claimOptions.type.toLowerCase(),
            claimOptions.crdContext
          ),
          subject: credentialSubject
        }) as CredentialUT

        const claimSubject: ClaimSubject<CredentialUT> = {
          data: {
            '@type': `${CLAIM_TYPE_PREFFIX}:${claimOptions.type}`,
            credential: unsignedCredential
          },
          did: didUnsigned
        }

        const claimUnsigned = await wallet.ctx.buildCredential<
          WrappedDocument<{ credential: CredentialUT }>,
          ClaimSubject<CredentialUT>
        >({
          id: didUnsigned.id,
          type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_CLAIM_TYPE],
          holder: wallet.did.helper().extractProofController(holder),
          subject: claimSubject,
          context: wallet.ctx.buildLDContext(
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

        return await wallet.ctx.signCredential(
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
    }),

    bundle: <
      BundledClaim extends ClaimCredential,
      BundledOffer extends OfferCredential = OfferCredential
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

        const unsigned = await wallet.ctx.buildPresentation(claims, {
          holder: holder.id,
          type: CREDENTIAL_CLAIM_TYPE
        }) as UnsignedPresentation<BundledClaim>

        return await wallet.ctx.signPresentation(unsigned, holder) as ClaimBundle<BundledClaim>
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
        const issuer = await wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential(
          bundle.holder.id, REGISTRY_SECTION_PEER
        )

        if (!issuer) {
          throw new Error(ERROR_UNTRUSTED_ISSUER)
        }

        const issuerDid = await wallet.did.lookUpDid<DIDDocument>(issuer.credential.holder.id)

        let [result] = await wallet.ctx.verifyPresentation(bundle, issuerDid)

        result = result && bundle.type.includes(CREDENTIAL_OFFER_TYPE)

        type Payload = ClaimPayload<BundledClaim>
        type Extension = ClaimExtenstion<BundledClaim>

        const claims = wallet.getRegistry(REGISTRY_TYPE_CLAIMS).getCredential<
          CredentialSubject<WrappedDocument<Payload>, Extension>,
          Presentation<ClaimCredential<ClaimSubject<
            UnsignedCredential<CredentialSubject<WrappedDocument<Payload>, Extension>>
          >>>
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
        type Payload = ClaimPayload<BundledClaim>
        type Extension = ClaimExtenstion<BundledClaim>
        type SubjectT = CredentialSubject<WrappedDocument<Payload>, Extension>
        const claim = wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)
          .getCredential<SubjectT, ClaimBundle<BundledOffer>>(response.id)
        if (claim) {
          return await wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)
            .removeCredential(claim.credential)
        }
      },

      store: async (bundle: OfferBundle<BundledOffer>) => {
        type Payload = ClaimPayload<BundledClaim>
        type Extension = ClaimExtenstion<BundledClaim>
        type SubjectT = CredentialSubject<WrappedDocument<Payload>, Extension>

        const registry = wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)
        return Promise.all(bundle.verifiableCredential.map(
          async (offer) => {
            wallet.did.addDID(offer.credentialSubject.did)
            return await registry.addCredential<SubjectT, Credential<SubjectT>>(
              offer.credentialSubject.data.credential as Credential<SubjectT>
            )
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

        let [result] = await wallet.ctx.verifyPresentation(bundle, did)

        result = result && bundle.type.includes(CREDENTIAL_CLAIM_TYPE)

        return { result, requests, entity }
      },

      verify: async (bundle: RequestBundle) => {
        const credentials = [...bundle.verifiableCredential]
        const identity = await _identityHelper.extractEntity(credentials)
        const did = identity?.credentialSubject.did
        if (!did) {
          throw new Error(ERROR_UNTRUSTED_ISSUER)
        }

        return await wallet.ctx.verifyPresentation(bundle, did)
      }
    }),

    response: ({ holder, identity }: {
      holder?: DIDDocument,
      identity?: IdentityParams | EntityIdentity | boolean
    } = {}) => ({
      build: async (requests: RequestCredential[] = [], requestBundle?: RequestBundle) => {
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

            const unsignedSatellite = await wallet.ctx.buildCredential({
              id: did.id,
              type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_SATELLITE_TYPE],
              holder: holder.id,
              subject: satelliteSubject,
              context: wallet.ctx.buildLDContext(
                'credential/satellite',
                { did: { '@id': 'scm:did', '@type': '@json' } }
              )
            })

            const satellite = await wallet.ctx.signCredential(
              unsignedSatellite,
              holder
            )

            return [wrap.credential, satellite]
          }
        ))).flat(1).map(cred => responses.push(cred))

        const unsignedPresentation = await wallet.ctx.buildPresentation(
          responses, {
          id: requestBundle?.id,
          holder: holder.id,
          type: CREDENTIAL_RESPONSE_TYPE
        })

        return await wallet.ctx.signPresentation(unsignedPresentation, holder, {
          challange: requestBundle?.proof.challenge,
          domain: requestBundle?.proof.domain
        }) as Presentation<EntityIdentity | Credential>
      }
    })
  }
}