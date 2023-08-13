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

import { buildExtension, buildExtensionSchema } from "@owlmeans/vc-core"
import { en } from "./i18n"
import {
  BASIC_IDENTITY_TYPE, OWLMEANS_AUTH_REQUEST_TYPE, OWLMEANS_AUTH_RESPONSE_TYPE,
  OWLMEANS_CREDENTIAL_TYPE_AUTH, OWLMEANS_EXT_ATUH_NAMESPACE
} from "./types"


let authExtensionSchema = buildExtensionSchema({
  name: 'extension.details.name',
  code: 'owlmeans-vc-auth',
}, {
  [OWLMEANS_CREDENTIAL_TYPE_AUTH]: {
    mainType: OWLMEANS_CREDENTIAL_TYPE_AUTH,
    requestType: OWLMEANS_AUTH_REQUEST_TYPE,
    responseType: OWLMEANS_AUTH_RESPONSE_TYPE,
    defaultNameKey: 'cred.auth.name',
    contextUrl: 'https://schema.owlmeans.com/auth.json',
    credentialContext: {
      '@version': 1.1,
      did: "https://www.w3.org/ns/did/v1#id",
      pinCode: "http://www.w3.org/2001/XMLSchema#string",
      createdAt: "http://www.w3.org/2001/XMLSchema#datetime",
    },
    evidence: { type: BASIC_IDENTITY_TYPE, signing: true }
  },
  [OWLMEANS_AUTH_REQUEST_TYPE]: {
    mainType: OWLMEANS_AUTH_REQUEST_TYPE,
    requestType: OWLMEANS_AUTH_REQUEST_TYPE,
    responseType: OWLMEANS_AUTH_RESPONSE_TYPE,
    mandatoryTypes: [OWLMEANS_CREDENTIAL_TYPE_AUTH],
    defaultNameKey: 'request.auth.name',
    contextUrl: 'https://schema.owlmeans.com/auth-request.json',
    credentialContext: {
      '@version': 1.1,
      did: "https://www.w3.org/ns/did/v1#id",
      pinCode: "http://www.w3.org/2001/XMLSchema#string",
      createdAt: "http://www.w3.org/2001/XMLSchema#datetime",
    }
  },
  [OWLMEANS_AUTH_RESPONSE_TYPE]: {
    mainType: OWLMEANS_AUTH_RESPONSE_TYPE,
    responseType: OWLMEANS_AUTH_RESPONSE_TYPE,
    mandatoryTypes: [OWLMEANS_CREDENTIAL_TYPE_AUTH],
    credentialContext: {},
    evidence: { type: BASIC_IDENTITY_TYPE, signing: true }
  }
})


export const authExtension = buildExtension(authExtensionSchema)

authExtension.localization = {
  ns: OWLMEANS_EXT_ATUH_NAMESPACE,
  translations: { en }
}