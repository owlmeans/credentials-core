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

import { EncryptedStore } from '@owlmeans/vc-core'
import { FunctionComponent } from 'react'
import {
  BasicNavigator, EmptyProps, WalletComponentProps, useOwlWallet, WalletNavigatorMethod,
  withOwlWallet, WrappedComponentProps
} from '../../common/'


export const StoreList: FunctionComponent<StoreListParams> =
  withOwlWallet<StoreListProps, StoreListNavigator>(
    'StoreList',
    ({ t, i18n, navigator, counter, renderer: Renderer }) => {
      const { handler } = useOwlWallet()

      const _props: StoreListImplProps = {
        t, i18n,

        stores: Object.entries(handler.stores).map(([, store]) => store),

        login: (alias: string) => {
          if (navigator) {
            navigator.login(alias)
          }
        },

        create: () => {
          if (navigator) {
            navigator.create()
          }
        },

        upload: (store: EncryptedStore) => {
          if (store.alias) {
            handler.stores[store.alias] = store
            handler.notify()
          }
        },

        delete: (alias: string) => {
          if (handler.stores[alias]) {
            handler.stores[alias].toRemove = true
            handler.notify()
          }
        },

        counter
      }

      return <Renderer {..._props} />
    }, {
    namespace: 'owlmeans-wallet-store', transformer: (_, __, handler) => {
      return { counter: Object.entries(handler?.stores || {}).length }
    }
  })

export type StoreListProps = WalletComponentProps<StoreListParams, StoreListImplParams, StoreListState, StoreListNavigator>

export type StoreListState = {
  counter: number
}

export type StoreListParams = {
} & EmptyProps

export type StoreListImplParams = {
  login: (alias: string) => void

  create: () => void

  upload: (store: EncryptedStore) => void

  delete: (alias: string) => void

  stores: EncryptedStore[]
}

export type StoreListImplProps = WrappedComponentProps<StoreListImplParams, StoreListState>

export type StoreListNavigator = BasicNavigator & {
  login: WalletNavigatorMethod<string>
  create: WalletNavigatorMethod
}