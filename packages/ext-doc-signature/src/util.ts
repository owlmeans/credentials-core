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

import { MaybeArray, normalizeValue } from "@owlmeans/vc-core"
import { Presentation, Credential } from "@owlmeans/vc-core"
import {
  BASIC_IDENTITY_TYPE, OWLMEANS_SIGNATURE_REQUEST_TYPE, OWLMEANS_SIGNATURE_RESPONSE_TYPE,
  OWLMEANS_CREDENTIAL_TYPE_SIGNATURE, SignaturePresentation, OWLMEANS_SIGNATURE_CLAIM_TYPE,
  SignatureCredential
} from "./types"


export const getSignatureRequestFromPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(OWLMEANS_SIGNATURE_REQUEST_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(OWLMEANS_SIGNATURE_REQUEST_TYPE)
  )
}

export const getSignatureCredentialClaimFromPresentation = (presentation: SignaturePresentation) => {
  if (!presentation.type.includes(OWLMEANS_SIGNATURE_CLAIM_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(OWLMEANS_SIGNATURE_CLAIM_TYPE)
  )
}

export const getSignatureCredentialOfferFromPresentation = (presentaton: SignaturePresentation) => {
  return presentaton.verifiableCredential.find(
    credential => credential.type.includes(OWLMEANS_CREDENTIAL_TYPE_SIGNATURE)
  ) as SignatureCredential
}

export const getSignatureResponseFromPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(OWLMEANS_SIGNATURE_RESPONSE_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(OWLMEANS_CREDENTIAL_TYPE_SIGNATURE)
  )
}

export const getSignatureRequestOwner = (crednetial: Credential) => {
  if (!crednetial.type.includes(OWLMEANS_SIGNATURE_REQUEST_TYPE)) {
    return undefined
  }

  return normalizeValue<Credential>(crednetial.evidence as MaybeArray<Credential>).find(
    evidence => evidence?.type.includes(BASIC_IDENTITY_TYPE)
  )
}