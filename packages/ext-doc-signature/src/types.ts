/**
 *  Copyright 2023 OwlMeans, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Presentation, Credential } from "@owlmeans/vc-core"


export const OWLMEANS_CREDENTIAL_TYPE_SIGNATURE = 'OwlMeans:Credentials:Signature'

export const OWLMEANS_CLAIM_TYPE_SIGNATURE = 'OwlMeans:Credentials:Signature:Claim'
export const OWLMEANS_OFFER_TYPE_SIGNATURE = 'OwlMeans:Credentials:Signature:Offer'

export const OWLMEANS_CRED_PERSONALID = 'OwlMeans:Std:PersonalId'
export const OWLMEANS_CLAIM_PRESONALID = 'OwlMeans:Std:PersonalId:Claim'
export const OWLMEANS_OFFER_PRESONALID = 'OwlMeans:Std:PersonalId:Offer'

export const OWLMEANS_SIGNATURE_REQUEST_TYPE = 'OwlMeans:Credentials:Signature:Request'
export const OWLMEANS_SIGNATURE_RESPONSE_TYPE = 'OwlMeans:Credentials:Signature:Response'

export const OWLMEANS_SIGNATURE_CLAIM_TYPE = 'OwlMeans:Credentials:Signature:Claim'
export const OWLMEANS_SIGNATURE_OFFER_TYPE = 'OwlMeans:Credentials:Signature:Offer'

export const BASIC_IDENTITY_TYPE = 'Identity'

export const OWLMEANS_EXT_SIGNATURE_NAMESPACE = 'owlmeans-vc-ext-doc-signature'

export type OwlMeansSignatureCredential = typeof OWLMEANS_CREDENTIAL_TYPE_SIGNATURE

export type OwlMeansStdPersonalIdClaim = Presentation<Credential<PersonalIdSubject>>

export type SignatureCredential = Credential<SignatureSubject>

export type SignaturePresentation = Presentation<SignatureCredential>

export type SignatureSubject = {
  name: string
  description?: string
  documentHash: string
  docType: string
  filename?: string
  url?: string
  creationDate: string
  version?: string
  author: string
  authorId?: string
  signedAt?: string
}

export type SignatureRequestSubject = {
  description?: string
  documentHash?: string
  url?: string
  authorId?: string
  version?: string
}

export type PersonalIdSubject = {
  name: string,
  identifier: string,
  country: string,
  gender: string,
  givenName: string,
  familyName: string,
  additionalName: string,
  birthDate: string,
  validFrom: string,
  validUntil: string
}

export const personaIdDefaultValues = {
  name: '',
  identifier: '',
  country: '',
  gender: 'Male',
  givenName: '',
  familyName: '',
  additionalName: '',
  birthDate: new Date().toUTCString(),
  validFrom: new Date().toUTCString(),
  validUntil: new Date().toUTCString()
}

export const DOCUMENT_TYPE_JSON = 'JSON'
export const DOCUMENT_TYPE_TEXT = 'Text'
export const DOCUMENT_TYPE_BINARY = 'Binary'

export const ERROR_WIDGET_AUTHENTICATION = 'ERROR_WIDGET_AUTHENTICATION'
export const ERROR_WIDGET_EXTENSION = 'ERROR_WIDGET_EXTENSION'
export const ERROR_INVALID_SIGNATURE_TO_ACCEPT = 'ERROR_INVALID_SIGNATURE_TO_ACCEPT'