/**
 *  Copyright 2024 OwlMeans, Inc
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
import { Extension, ExtensionServiceBuilder } from './ext/types'
import { CredentialDescription, ExtensionDetails } from './schema'

export interface ExtensionBuilder {
  ns?: string
  ext?: Extension
  translations: Record<string, Record<string, unknown>>
  details: ExtensionDetails
  credentials: { [key: string]: CredentialDescription }
  factoryBuilder?: ExtensionServiceBuilder

  setNamespace: (ns: string) => void
  addTranslation: (lng: string, resource: Record<string, unknown>) => void
  addCredential: (description: Partial<CredentialDescription>, subject?: Record<string, string | null>) => CredentialDescription
  build: () => Extension
}

export interface ExtensionBuilderParams {

}
