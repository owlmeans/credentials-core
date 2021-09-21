import { DIDDocument, DIDDocumentUnsinged } from "@owlmeans/regov-ssi-did"
import { 
  CredentialSubject, 
  WrappedDocument, 
  UnsignedCredential, 
  Credential, 
  Presentation,
  MaybeArray
} from "@owlmeans/regov-ssi-core"


export type ClaimSubject<
  CredentialUT extends UnsignedCredential<MaybeArray<CredentialSubject>> = UnsignedCredential<MaybeArray<CredentialSubject>>
  > =
  CredentialSubject<
    WrappedDocument<{ credential: CredentialUT }>,
    { did: DIDDocumentUnsinged }
  >

export const CREDENTIAL_CLAIM_TYPE = 'CredentialClaim'

export type ClaimCredential<Subject extends ClaimSubject = ClaimSubject>
  = Credential<Subject>

export type ClaimBundle<BundledClaim extends ClaimCredential>
  = Presentation<BundledClaim>

export type ClaimPayload<Claim> = Claim extends ClaimCredential<infer ClaimSubjectT>
  ? ClaimSubjectT extends ClaimSubject<infer CredentialUT>
  ? CredentialUT extends UnsignedCredential<infer Subject>
  ? Subject extends CredentialSubject<infer SourceType, any>
  ? SourceType extends WrappedDocument<infer Payload> ? Payload : never
  : never
  : never
  : never
  : never

export type ClaimExtenstion<Claim> = Claim extends ClaimCredential<infer ClaimSubjectT>
  ? ClaimSubjectT extends ClaimSubject<infer CredentialUT>
  ? CredentialUT extends UnsignedCredential<infer Subject>
  ? Subject extends CredentialSubject<any, infer Extension>
  ? Extension
  : never
  : never
  : never
  : never

export type SatelliteSubject<DocExtension extends {} = {}> 
  = CredentialSubject<SetelliteSubjectType<DocExtension>, {}>

export type SetelliteSubjectType<DocExtension extends {} = {}> 
  = WrappedDocument<{ did: DIDDocument } & DocExtension>

export type SatelliteCredential<Subject extends SatelliteSubject = SatelliteSubject> 
  = Credential<Subject>

export type ResponseBundle<CredentialT extends Credential> = {
  presentation: Presentation<CredentialT | SatelliteCredential>,
  did: DIDDocument
}

export const ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL = 'ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL'

export const ERROR_UNTRUSTED_ISSUER = 'ERROR_UNTRUSTED_ISSUER'
export const ERROR_NO_RELATED_DID_FOUND = 'ERROR_NO_RELATED_DID_FOUND'
export const ERROR_CLAIM_OFFER_DONT_MATCH = 'ERROR_CLAIM_OFFER_DONT_MATCH'

export const ERROR_WRONG_CLAIM_SUBJECT_TYPE = 'ERROR_WRONG_CLAIM_SUBJECT_TYPE'

export const CLAIM_TYPE_PREFFIX = 'Claim'

export const CREDENTIAL_RESPONSE_TYPE = 'CredentialResponse'

export const CREDENTIAL_SATELLITE_TYPE = 'CredentialSatellit'
