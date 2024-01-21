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

import { Extension, MaybeArray, addToValue, normalizeValue, simplifyValue, singleValue } from '@owlmeans/vc-core'
import { ExtensionMenuBuilder, UIExtProductMeta, UIExtensionBuilder } from './types'
import { UIExtensionFactoryProduct, buildUIExtension } from './extension'

export const createUIExtensionBuilder = (ext: Extension): UIExtensionBuilder => {
  const builder: UIExtensionBuilder = {
    menuItems: [],

    products: {},

    addMenu: (tag, defaultParams) => {
      const menu: ExtensionMenuBuilder = {
        addItem: (title, action, params) => {
          builder.menuItems.push({
            ...defaultParams,
            ...params,
            menuTag: tag,
            title, action, 
            ns: params?.ns ?? defaultParams?.ns ?? ext.localization?.ns
          })
        }
      }

      return menu
    },

    addComponent: (purpose, com, path, type) => {
      builder.addRenderer(purpose, {
        com, extensionCode: `${ext.schema.details.code}${purpose}`,
        params: { path: path ?? '', ns: ext.localization?.ns ?? ext.schema.details.code }
      }, type)
    },

    addRenderer: (purpose, product, type) => {
      type = type ?? '_'
      const _purpose = builder.products[purpose] = builder.products[purpose] ?? {}
      const key = singleValue(type) as string
      _purpose[key] = simplifyValue(addToValue(_purpose[key], { type, product })) as MaybeArray<UIExtProductMeta>
    },

    build: () => {
      const uiExt = builder.ext = buildUIExtension(ext, (purpose, type) => {
        type = type ?? '_'
        const _purpose = builder.products[purpose]
        if (_purpose == null) {
          return []
        }

        const key = singleValue(type) as string
        const wrappers = _purpose[key]
        if (wrappers == null) {
          return []
        }

        return normalizeValue(wrappers).filter(
          wrapper => normalizeValue(wrapper.type).every(_type => normalizeValue(type).includes(_type))
        ).map(wrapper => wrapper.product) as UIExtensionFactoryProduct<{}>[]
      })

      uiExt.menuItems = builder.menuItems

      return uiExt
    }
  }

  return builder
}
