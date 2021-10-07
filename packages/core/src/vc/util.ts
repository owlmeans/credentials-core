import { UnsignedCredential } from "."
import {
  Presentation,
  Credential
} from "./types"

export const isPresentation = (obj: any): obj is Presentation => {
  return typeof obj === 'object' && !!obj.verifiableCredential
}

export const extractSubject = <
  CredentialT extends UnsignedCredential = Credential
>(cred: CredentialT, idx?: number) => {
  type SubjectT = CredentialT extends UnsignedCredential<infer T>
    ? T extends Array<infer ST>
    ? ST : T
    : never

  const subject = Array.isArray(cred.credentialSubject)
    ? cred.credentialSubject[idx || 0]
    : cred.credentialSubject

  return subject as SubjectT
}