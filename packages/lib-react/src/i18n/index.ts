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


import { InitOptions } from 'i18next'

import enStore from './en/store.json'
import enCommon from './en/common.json'
import enMain from './en/main.json'
import enCredential from './en/credential.json'

import ruStore from './ru/store.json'
import ruCommon from './ru/common.json'
import ruMain from './ru/main.json'
import ruCredential from './ru/credential.json'

import byStore from './by/store.json'
import byCommon from './by/common.json'
import byMain from './by/main.json'
import byCredential from './by/credential.json'

export const i18nDefaultOptions: InitOptions = {
  fallbackLng: 'en',
  debug: false,
  resources: {
    en: {
      'owlmeans-wallet-store': enStore,
      'owlmeans-wallet-common': enCommon,
      'owlmeans-wallet-main': enMain,
      'owlmeans-wallet-credential': enCredential,
    },
    ru: {
      'owlmeans-wallet-store': ruStore,
      'owlmeans-wallet-common': ruCommon,
      'owlmeans-wallet-main': ruMain,
      'owlmeans-wallet-credential': ruCredential,
    },
    be: {
      'owlmeans-wallet-store': byStore,
      'owlmeans-wallet-common': byCommon,
      'owlmeans-wallet-main': byMain,
      'owlmeans-wallet-credential': byCredential,
    }
  },
  ns: [
    'owlmeans-wallet-common', 'owlmeans-wallet-main', 
    'owlmeans-wallet-store', 'owlmeans-wallet-credential'
  ],
  fallbackNS: 'owlmeans-wallet-common',
  defaultNS: 'owlmeans-wallet-common',
  interpolation: {
    escapeValue: false
  }
}