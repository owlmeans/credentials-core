
import {
  buildVCV1,
  buildVCV1Skeleton,
  buildVCV1Unsigned,
  buildVPV1,
  buildVPV1Unsigned,
  validateVCV1,
  validateVPV1
} from "@affinidi/vc-common"

import {
  BuildCommonContextMethod,
  BuildCredentailOptions,
  SignCredentialOptions,
  BuildPresentationOptions,
  SignPresentationOptions,
} from "./context/types"
import {
  Credential,
  CredentialSubject,
  WrappedDocument,
  UnsignedCredential,
  Presentation,
  PresentationHolder,
  UnsignedPresentation,
} from './types'
import {
  COMMON_CRYPTO_ERROR_NOID,
  COMMON_CRYPTO_ERROR_NOPK,
  COMMON_CRYPTO_ERROR_NOPUBKEY,
  basicHelper,
  COMMON_CRYPTO_ERROR_NOKEY
} from "@owlmeans/regov-ssi-common"
import {
  DIDDocument,
  buildDocumentLoader,
  DID_REGISTRY_ERROR_NO_DID,
  DID_REGISTRY_ERROR_NO_KEY_BY_DID,
  VERIFICATION_KEY_HOLDER,
  VERIFICATION_KEY_CONTROLLER
} from "@owlmeans/regov-ssi-did"

/**
 * @TODO Sign and verify VC with nonce from did.
 * Probably it can be done on the subject level
 */
export const buildCommonContext: BuildCommonContextMethod = async ({
  keys,
  crypto,
  did,
  defaultSchema
}) => {
  const documentLoader = buildDocumentLoader(did)(() => undefined)

  return {
    keys,

    crypto,

    did,

    buildLDContext: (url, extendedCtx?, baseUrl?) => {
      const uri = `${baseUrl || defaultSchema || 'https://example.org'}${url ? `/${url}` : ''}#`
      return {
        '@version': 1.1,
        scm: uri,
        data: extendedCtx
          ? {
            '@context': {
              '@version': 1.1,
              'scmdata': `${baseUrl || defaultSchema || 'https://example.org'}${url ? `/${url}/data` : ''}#`
            },
            '@id': `scmdata:id`,
            '@type': 'scmdata:type'
          }
          : { '@id': 'scm:data', '@type': '@json' },
        ...extendedCtx
      }
    },

    buildCredential: async <
      T extends WrappedDocument = WrappedDocument,
      S extends CredentialSubject<T> = CredentialSubject<T>,
      U extends UnsignedCredential<S> = UnsignedCredential<S>
    >(options: BuildCredentailOptions<T>) => {
      const skeleton = buildVCV1Skeleton({
        context: options.context,
        id: options.id,
        type: options.type,
        holder: {
          id: options.holder
        },
        credentialSubject: options.subject,
      })

      return buildVCV1Unsigned({
        skeleton,
        issuanceDate: options.issueanceDate || (new Date).toISOString()
      }) as U
    },

    signCredential: async <
      S extends CredentialSubject = CredentialSubject,
      C extends Credential<S> = Credential<S>
    >(
      unsingedCredential: UnsignedCredential<S>,
      issuer: DIDDocument,
      options?: SignCredentialOptions
    ) => {
      const keyId = options?.keyId || did.helper().extractProofController(issuer) === unsingedCredential.holder.id
        ? VERIFICATION_KEY_HOLDER
        : VERIFICATION_KEY_CONTROLLER

      const key = await did.extractKey(issuer, keyId)
      if (!key) {
        throw new Error(COMMON_CRYPTO_ERROR_NOKEY)
      }

      await keys.expandKey(key)
      if (!key.pk) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPK)
      }

      try {
        return await buildVCV1({
          unsigned: unsingedCredential,
          issuer: {
            did: issuer.id,
            keyId,
            privateKey: key.pk,
            publicKey: key.pubKey
          },
          getSignSuite: (options) => {
            return crypto.buildSignSuite({
              publicKey: <string>options.publicKey,
              privateKey: options.privateKey,
              id: `${options.controller}#${options.keyId}`,
              controller: options.controller
            })
          },
          documentLoader,
          getProofPurposeOptions: options?.buildProofPurposeOptions
        }) as C
      } catch (e: any) {
        console.log(e.details)

        throw e
      }
    },

    verifyCredential: async (credential, didDoc, keyId) => {
      if (!didDoc) {
        didDoc = credential.issuer
      }
      if (typeof didDoc !== 'object') {
        didDoc = await did.lookUpDid<DIDDocument>(didDoc)
      }
      if (!didDoc) {
        throw new Error(DID_REGISTRY_ERROR_NO_DID)
      }
      const key = await did.extractKey(didDoc, keyId)
      if (!key) {
        throw new Error(DID_REGISTRY_ERROR_NO_KEY_BY_DID)
      }

      const result = await validateVCV1({
        getVerifySuite: (options) => {
          if (!key.pubKey) {
            throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
          }
          if (typeof didDoc !== 'object') {
            throw new Error(DID_REGISTRY_ERROR_NO_DID)
          }

          return crypto.buildSignSuite({
            publicKey: key.pubKey,
            privateKey: '',
            controller: didDoc.id,
            id: options.verificationMethod
          })
        },
        getProofPurposeOptions: async () => {
          return {
            controller: didDoc
          }
        },
        documentLoader
      })(credential)

      if (result.kind !== 'valid') {
        return [false, result]
      }

      return [true, result]
    },

    buildPresentation: async <
      C extends Credential = Credential,
      H extends PresentationHolder = PresentationHolder
    >(credentails: C[], options: BuildPresentationOptions) => {
      return buildVPV1Unsigned({
        id: options.id || `urn:uuid:${basicHelper.makeRandomUuid()}`,
        vcs: [...credentails],
        holder: {
          id: options.holder
        },
        context: options.context,
        type: options.type
      }) as UnsignedPresentation<C, H>
    },

    signPresentation: async<
      C extends Credential = Credential,
      H extends PresentationHolder = PresentationHolder
    >(
      unsignedPresentation: UnsignedPresentation<C, H>,
      holder: DIDDocument,
      options?: SignPresentationOptions
    ) => {
      const keyId = options?.keyId || did.helper().extractKeyId(holder.proof.verificationMethod)
      const key = await did.extractKey(holder, keyId)
      if (!key) {
        throw new Error(COMMON_CRYPTO_ERROR_NOKEY)
      }

      await keys.expandKey(key)
      if (!key.pk) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPK)
      }
      if (!key.id) {
        throw new Error(COMMON_CRYPTO_ERROR_NOID)
      }

      return await buildVPV1({
        unsigned: unsignedPresentation,
        holder: {
          did: holder.id,
          keyId: keyId,
          privateKey: key.pk,
          publicKey: key.pubKey
        },
        documentLoader,
        getSignSuite: (options) => {
          return crypto.buildSignSuite({
            publicKey: <string>options.publicKey,
            privateKey: options.privateKey,
            id: `${options.controller}#${options.keyId}`,
            controller: options.controller
          })
        },
        getProofPurposeOptions: async () => ({
          challenge: options?.challange || unsignedPresentation.id || basicHelper.makeRandomUuid(),
          domain: options?.domain || holder.id
        }),
      }) as Presentation<C, H>
    },

    verifyPresentation: async (presentation, didDoc?) => {
      const result = await validateVPV1({
        documentLoader: didDoc ? buildDocumentLoader(did)(() => didDoc) : documentLoader,
        getVerifySuite: async (options) => {
          const didId = did.helper().parseDIDId(options.verificationMethod)
          didDoc = didDoc || await did.lookUpDid<DIDDocument>(didId.did)
          if (!didDoc) {
            throw new Error(DID_REGISTRY_ERROR_NO_DID)
          }

          const key = await did.extractKey(
            didDoc,
            did.helper().extractKeyId(options.verificationMethod)
          )
          if (!key) {
            throw new Error(DID_REGISTRY_ERROR_NO_KEY_BY_DID)
          }

          if (!key.pubKey) {
            throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
          }
          return crypto.buildSignSuite({
            publicKey: key.pubKey,
            privateKey: '',
            controller: didId.did,
            id: options.verificationMethod
          })
        },
        getProofPurposeOptions: async (options) => ({
          controller: <DIDDocument>await did.lookUpDid(options.controller)
        })
      })(presentation)

      if (result.kind !== 'valid') {
        return [false, result]
      }

      return [true, result]
    }
  }
}