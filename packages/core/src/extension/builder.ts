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

import { DEFAULT_CRED_SUFFIX } from './consts'
import { buildExtension } from './ext'
import { META_ROLE_CLAIM, META_ROLE_OFFER, META_ROLE_REFUSE, META_ROLE_REQUEST, META_ROLE_RESPONSE, buildExtensionSchema } from './schema'
import { ExtensionBuilder, ExtensionBuilderParams } from './types'

export const createExtensionBuilder = (code: string, perfix: string, _params?: ExtensionBuilderParams): ExtensionBuilder => {
  const _builder: ExtensionBuilder = {
    credentials: {},

    translations: {},

    details: { code, name: 'extension.details.name' },

    setNamespace: ns => {
      _builder.ns = ns
    },

    addTranslation: (lng, resource) => {
      _builder.translations[lng] = resource
    },

    addCredential: (description, subject) => {
      // [OWLMEANS_CREDENTIAL_TYPE_PASSWORD]: {
      //   mainType: OWLMEANS_CREDENTIAL_TYPE_PASSWORD,
      //   defaultNameKey: 'cred.password.name',
      //   contextUrl: 'https://schema.owlmeans.com/pro/passwords/passcred.json',
      //   credentialContext: {
      //     '@version': 1.1,
      //     label: "http://www.w3.org/2001/XMLSchema#string",
      //     service: "http://www.w3.org/2001/XMLSchema#string",
      //     url: "http://www.w3.org/2001/XMLSchema#string",
      //     login: "http://www.w3.org/2001/XMLSchema#string",
      //     password: "http://www.w3.org/2001/XMLSchema#string"
      //   },
      //   requestType: OWLMEANS_REQUEST_TYPE_PASSWORD,
      //   registryType: REGISTRY_TYPE_CREDENTIALS,
      //   claimType: OWLMEANS_CLAIM_TYPE_PASSWORD,
      //   offerType: OWLMEANS_OFFER_TYPE_PASSWORD
      // }

      const mainType = addPeffix(perfix, description.mainType ?? DEFAULT_CRED_SUFFIX, description.mainType == null)
      const alias = (description.mainType ?? DEFAULT_CRED_SUFFIX).replaceAll(/\W+/g,'-')
        .replace(/^\W+/, '').toLowerCase()
      const defaultNameKey = description.defaultNameKey ?? 'cred.' + alias + '.name'
      const contextUrl = description.contextUrl ?? 'https://schema.owlmeans.com/' + code + '/' + alias + '.json'

      _builder.factoryBuilder = _builder.factoryBuilder ?? {}
      _builder.factoryBuilder[mainType] = {}

      return _builder.credentials[mainType] = {
        ...description,
        mainType,
        defaultNameKey,
        contextUrl,
        credentialContext: {
          '@version': 1.1,
          ...description.credentialContext,
          ...(Object.entries(subject ?? {}).reduce((subject, [key, value]) => ({
            ...subject,
            [key]: value == null ? 'http://www.w3.org/2001/XMLSchema#string' : value
          }), {} as Record<string, string>))
        },
        requestType: description.requestType ?? mainType + ':' + capitalize(META_ROLE_REQUEST),
        responseType: description.responseType ?? mainType + ':' + capitalize(META_ROLE_RESPONSE),
        claimType: description.claimType ?? mainType + ':' + capitalize(META_ROLE_CLAIM),
        offerType: description.offerType ?? mainType + ':' + capitalize(META_ROLE_OFFER),
        refuseType: description.refuseType ?? mainType + ':' + capitalize(META_ROLE_REFUSE)
      }
    },

    build: () => {
      const schema = buildExtensionSchema(_builder.details, _builder.credentials)

      const ext = buildExtension(schema, _builder.factoryBuilder)

      ext.localization = {
        ns: _builder.ns ?? code,
        translations: _builder.translations
      }

      return _builder.ext = ext
    }
  }

  return _builder
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const addPeffix = (prefix: string, value: string, force: boolean = false) =>
  value.startsWith(':') 
    ? prefix + value
    : force 
      ? prefix + ':' + value
      : value
