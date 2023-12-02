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

import { BuildMethodParams, Credential, SignMethodParams, UnsignedCredential } from '@owlmeans/vc-core'
import { TFunction, i18n } from 'i18next'
import { OwlWalletValidationRules } from './context'

export interface EmpoweredExtension {
  factory: (type: string) => EmpoweredCredentialFactory
}

export interface EmpoweredCredentialFactory {
  build: <Params extends BuildMethodParams>(params: Params) => Promise<UnsignedCredential>
  sign: <Params extends SignMethodParams>(params: Params) => Promise<Credential>
}

export interface SimpleView {
  t: TFunction
  i18n: i18n
}

export interface SimpleFormView extends SimpleView {
  rules?: OwlWalletValidationRules
}

export interface SimpleViewField extends SimpleFormView {
  field: string
}
