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

import { Extension } from '@owlmeans/vc-core'
import { ERROR_NO_UIEXTENSION, UIExtension } from '../extension'
import { ERROR_NO_WALLET_HANDLER_AUTH } from './consts'
import { useOwlWallet } from './context'
import { EmpoweredCredentialFactory, EmpoweredExtension } from './types'

export const useWalletExtention = (ext: Extension | UIExtension | string): EmpoweredExtension => {
  const { extensions, handler } = useOwlWallet()
  const extObj = (typeof ext === 'string'
    ? extensions?.getExtension(ext)
    : Object.hasOwn(ext, 'schema')
      ? extensions?.getExtensionByCode((ext as Extension).schema.details.code)
      : ext) as UIExtension | undefined

  if (extObj == null) {
    throw ERROR_NO_UIEXTENSION
  }

  const _ext: EmpoweredExtension = {
    factory: type => {
      const factory = extObj.extension.getFactory(type)
      const _factory: EmpoweredCredentialFactory = {
        build: async params => {
          if (handler.wallet == null) {
            throw ERROR_NO_WALLET_HANDLER_AUTH
          }

          return factory.build(handler.wallet, { ...params, extensions })
        },
        sign: async params => {
          if (handler.wallet == null) {
            throw ERROR_NO_WALLET_HANDLER_AUTH
          }

          return factory.sign(handler.wallet, { ...params, extensions })
        },
      }

      return _factory
    }
  }

  return _ext
}
