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

import { Credential, Presentation } from '@owlmeans/vc-core'


export const OWLMEANS_EXT_ATUH_NAMESPACE = 'owlmeans-vc-ext-auth'

export const OWLMEANS_CREDENTIAL_TYPE_AUTH = 'OwlMeans:Credentials:Auth'

export const OWLMEANS_AUTH_REQUEST_TYPE = 'OwlMeans:Credentials:Auth:Request'

export const OWLMEANS_AUTH_RESPONSE_TYPE = 'OwlMeans:Credentials:Auth:Response'

export const REGOV_CREDENTIAL_TYPE_AUTH = 'OwlMeans:Regov:Auth'

export const REGOV_AUTH_REQUEST_TYPE = 'OwlMeans:Regov:Auth:Request'

export const REGOV_AUTH_RESPONSE_TYPE = 'OwlMeans:Regov:Auth:Response'

export const BASIC_IDENTITY_TYPE = 'Identity'

export const ERROR_NO_EXTENSION = 'ERROR_NO_EXTENSION'
export const ERROR_NO_AUTHENTICATION_FROM_EXTERNAL_WALLET = 'ERROR_NO_AUTHENTICATION_FROM_EXTERNAL_WALLET'
export const ERROR_WRONG_AUTHENTICATION = 'ERROR_WRONG_AUTHENTICATION'
export const ERROR_NO_CONNECTION = 'ERROR_NO_CONNECTION'

export const SERVER_PROVIDE_AUTH = '/auth/response/provide'
export const SERVER_REQUEST_AUTH = '/auth/request/produce/:did'
export const SERVER_VALIDATE_AUTH = '/auth/response/validate'
export const SERVER_INTEGRATION_ALIAS = 'integration'

export type AuthSubject = {
  did: string
  pinCode?: string,
  createdAt: string,
}

export type AuthCredential = Credential<AuthSubject>
export type AuthRequest = Presentation<AuthCredential>