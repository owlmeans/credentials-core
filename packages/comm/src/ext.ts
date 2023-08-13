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
import { OWLMEANS_COMM_REQUEST_TYPE, OWLMEANS_COMM_RESPONSE_TYPE, OWLMEANS_CREDENTIAL_TYPE_COMM, BASIC_IDENTITY_TYPE } from "./types"


let extensionSchema = buildExtensionSchema({
  name: 'extension.details.name',
  code: 'owlmeans-vc-comm',
}, {
  [OWLMEANS_CREDENTIAL_TYPE_COMM]: {
    mainType: OWLMEANS_CREDENTIAL_TYPE_COMM,
    requestType: OWLMEANS_COMM_REQUEST_TYPE,
    responseType: OWLMEANS_COMM_RESPONSE_TYPE,
    defaultNameKey: 'cred.comm.name',
    contextUrl: 'https://schema.owlmeans.com/comm.json',
    credentialContext: {
      '@version': 1.1,
      did: "https://www.w3.org/ns/did/v1#id",
      handshakeSequence: "http://www.w3.org/2001/XMLSchema#string",
      createdAt: "http://www.w3.org/2001/XMLSchema#datetime",
    },
    evidence: { type: BASIC_IDENTITY_TYPE, signing: true }
  },
  [OWLMEANS_COMM_REQUEST_TYPE]: {
    mainType: OWLMEANS_COMM_REQUEST_TYPE,
    requestType: OWLMEANS_COMM_REQUEST_TYPE,
    responseType: OWLMEANS_COMM_RESPONSE_TYPE,
    mandatoryTypes: [OWLMEANS_CREDENTIAL_TYPE_COMM],
    defaultNameKey: 'request.comm.name',
    contextUrl: 'https://schema.owlmeans.com/comm-request.json',
    credentialContext: {
      '@version': 1.1,
      did: "https://www.w3.org/ns/did/v1#id",
      handshakeSequence: "http://www.w3.org/2001/XMLSchema#string",
      createdAt: "http://www.w3.org/2001/XMLSchema#datetime",
    }
  },
  [OWLMEANS_COMM_RESPONSE_TYPE]: {
    mainType: OWLMEANS_COMM_RESPONSE_TYPE,
    responseType: OWLMEANS_COMM_RESPONSE_TYPE,
    mandatoryTypes: [OWLMEANS_CREDENTIAL_TYPE_COMM],
    credentialContext: {
      '@version': 1.1,
      did: "https://www.w3.org/ns/did/v1#id",
      handshakeSequence: "http://www.w3.org/2001/XMLSchema#string",
      createdAt: "http://www.w3.org/2001/XMLSchema#datetime",
    },
    evidence: { type: BASIC_IDENTITY_TYPE, signing: true }
  }
})


export const extension = buildExtension(extensionSchema)
