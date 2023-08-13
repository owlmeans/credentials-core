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

import {
  addObserverToSchema, buildExtension, buildExtensionSchema, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
  IncommigDocumentEventParams
} from "@owlmeans/vc-core"
import {
  BASIC_IDENTITY_TYPE, OwlMeansSignatureCredential, OWLMEANS_CLAIM_PRESONALID, OWLMEANS_CLAIM_TYPE_SIGNATURE, 
  OWLMEANS_CREDENTIAL_TYPE_SIGNATURE, OWLMEANS_CRED_PERSONALID, OWLMEANS_EXT_SIGNATURE_NAMESPACE, 
  OWLMEANS_OFFER_PRESONALID, OWLMEANS_OFFER_TYPE_SIGNATURE, OWLMEANS_SIGNATURE_CLAIM_TYPE, 
  OWLMEANS_SIGNATURE_OFFER_TYPE, OWLMEANS_SIGNATURE_REQUEST_TYPE, OWLMEANS_SIGNATURE_RESPONSE_TYPE
} from "./types"
import { isCredential, isPresentation, REGISTRY_TYPE_CREDENTIALS, REGISTRY_TYPE_REQUESTS } from "@owlmeans/vc-core"
import enCommon from './i18n/en/common.json'
import ruCommon from './i18n/ru/common.json'
import byCommon from './i18n/by/common.json'
import { normalizeValue } from "@owlmeans/vc-core"


let signatureExtensionSchema = buildExtensionSchema<OwlMeansSignatureCredential>({
  name: 'extension.details.name',
  code: 'owlmeans-vc-doc-signature',
  types: {
    claim: OWLMEANS_CLAIM_TYPE_SIGNATURE,
    offer: OWLMEANS_OFFER_TYPE_SIGNATURE
  }
}, {
  [OWLMEANS_CREDENTIAL_TYPE_SIGNATURE]: {
    mainType: OWLMEANS_CREDENTIAL_TYPE_SIGNATURE,
    defaultNameKey: 'cred.signature.name',
    contextUrl: 'https://schema.owlmeans.com/doc-signature.json',
    credentialContext: {
      '@version': 1.1,
      name: "http://www.w3.org/2001/XMLSchema#string",
      description: "http://www.w3.org/2001/XMLSchema#string",
      documentHash: "http://www.w3.org/2001/XMLSchema#string",
      docType: "http://www.w3.org/2001/XMLSchema#string",
      filename: "http://www.w3.org/2001/XMLSchema#string",
      url: "http://www.w3.org/2001/XMLSchema#string",
      creationDate: "http://www.w3.org/2001/XMLSchema#datetime",
      version: "http://www.w3.org/2001/XMLSchema#string",
      author: "http://www.w3.org/2001/XMLSchema#string",
      authorId: "http://www.w3.org/2001/XMLSchema#string",
      signedAt: "http://www.w3.org/2001/XMLSchema#datetime",
    },
    evidence: {
      type: BASIC_IDENTITY_TYPE,
      signing: true,
    },
    requestType: OWLMEANS_SIGNATURE_REQUEST_TYPE,
    registryType: REGISTRY_TYPE_CREDENTIALS,
    claimType: OWLMEANS_SIGNATURE_CLAIM_TYPE,
    offerType: OWLMEANS_SIGNATURE_OFFER_TYPE,
  },
  [OWLMEANS_SIGNATURE_REQUEST_TYPE]: {
    mainType: OWLMEANS_SIGNATURE_REQUEST_TYPE,
    requestType: OWLMEANS_SIGNATURE_REQUEST_TYPE,
    mandatoryTypes: [OWLMEANS_CREDENTIAL_TYPE_SIGNATURE],
    defaultNameKey: 'request.signature.name',
    contextUrl: 'https://schema.owlmeans.com/doc-signature-request.json',
    credentialContext: {
      '@version': 1.1,
      description: "http://www.w3.org/2001/XMLSchema#string",
      documentHash: "http://www.w3.org/2001/XMLSchema#string",
      url: "http://www.w3.org/2001/XMLSchema#string",
      version: "http://www.w3.org/2001/XMLSchema#string",
      authorId: "http://www.w3.org/2001/XMLSchema#string",
    },
    registryType: REGISTRY_TYPE_REQUESTS,
  },
  [OWLMEANS_SIGNATURE_RESPONSE_TYPE]: {
    mainType: OWLMEANS_SIGNATURE_RESPONSE_TYPE,
    responseType: OWLMEANS_SIGNATURE_RESPONSE_TYPE,
    credentialContext: {}
  },
  [OWLMEANS_CRED_PERSONALID]: {
    mainType: OWLMEANS_CRED_PERSONALID,
    mandatoryTypes: [OWLMEANS_CREDENTIAL_TYPE_SIGNATURE],
    defaultNameKey: 'std.personalid.label',
    contextUrl: 'https://schema.owlmeans.com/std/personal-id.json',
    credentialContext: {
      '@version': 1.1,
      scm: 'https://schema.org/Person',
      scma: 'https://schema.org/GovernmentPermit',
      addr: 'https://schema.org/PostalAddress',
      name: { '@id': 'scma:name', '@type': 'scma:name' },
      identifier: { '@id': 'scma:identifier', '@type': 'scma:identifier' },
      country: { '@id': 'addr:addressCountry', '@type': 'addr:addressCountry' },
      gender: { '@id': 'scm:gender', '@type': 'scm:gender' },
      givenName: { '@id': 'scm:givenName', '@type': 'scm:givenName' },
      familyName: { '@id': 'scm:familyName', '@type': 'scm:familyName' },
      additionalName: { '@id': 'scm:additionalName', '@type': 'scm:additionalName' },
      birthDate: { '@id': 'scm:birthDate', '@type': 'scm:birthDate' },
      validFrom: {'@id': 'scma:validFrom', '@type': 'scma:validFrom'},
      validUntil: {'@id': 'scma:validUntil', '@type': 'scma:validUntil'}
    },
    registryType: REGISTRY_TYPE_CREDENTIALS,
    claimType: OWLMEANS_CLAIM_PRESONALID,
    offerType: OWLMEANS_OFFER_PRESONALID,
    arbitraryEvidence: true
  },
  [OWLMEANS_CLAIM_PRESONALID]: {
    mainType: OWLMEANS_CLAIM_PRESONALID,
    credentialContext: {}
  },
  [OWLMEANS_OFFER_PRESONALID]: {
    mainType: OWLMEANS_OFFER_PRESONALID,
    credentialContext: {}
  },
  [OWLMEANS_SIGNATURE_CLAIM_TYPE]: {
    mainType: OWLMEANS_SIGNATURE_CLAIM_TYPE,
    credentialContext: {}
  },
  [OWLMEANS_SIGNATURE_OFFER_TYPE]: {
    mainType: OWLMEANS_SIGNATURE_OFFER_TYPE,
    credentialContext: {}
  }
})

signatureExtensionSchema = addObserverToSchema(signatureExtensionSchema, {
  trigger: EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
  filter: async (_, params: IncommigDocumentEventParams) => {
    if (isCredential(params.credential)) {
      return normalizeValue(params.credential.type).includes(OWLMEANS_CREDENTIAL_TYPE_SIGNATURE)
    }

    if (isPresentation(params.credential)) {
      return normalizeValue(params.credential.type).includes(OWLMEANS_SIGNATURE_REQUEST_TYPE)
        || normalizeValue(params.credential.type).includes(OWLMEANS_SIGNATURE_RESPONSE_TYPE)
        || normalizeValue(params.credential.type).includes(OWLMEANS_SIGNATURE_CLAIM_TYPE)
        || normalizeValue(params.credential.type).includes(OWLMEANS_SIGNATURE_OFFER_TYPE)
    }

    return false
  }
})

export const signatureExtension = buildExtension(
  signatureExtensionSchema, {
  [OWLMEANS_CREDENTIAL_TYPE_SIGNATURE]: {},
  [OWLMEANS_SIGNATURE_REQUEST_TYPE]: {},
  [OWLMEANS_SIGNATURE_RESPONSE_TYPE]: {},
  [OWLMEANS_CRED_PERSONALID]: {},
  [OWLMEANS_CLAIM_PRESONALID]: {},
  [OWLMEANS_OFFER_PRESONALID]: {},
  [OWLMEANS_SIGNATURE_CLAIM_TYPE]: {},
  [OWLMEANS_SIGNATURE_OFFER_TYPE]: {}
})
signatureExtension.localization = {
  ns: OWLMEANS_EXT_SIGNATURE_NAMESPACE,
  translations: {
    en: enCommon,
    ru: ruCommon,
    be: byCommon
  }
}
