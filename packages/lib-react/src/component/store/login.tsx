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

import { FunctionComponent, useEffect } from 'react'

import { CryptoHelper } from '@owlmeans/vc-core'
import { buildWalletWrapper } from '@owlmeans/vc-core'
import { UseFormReturn } from 'react-hook-form'
import { useOwlWallet, withOwlWallet } from '../../common/context'
import {
  BasicNavigator, WalletNavigatorMethod, OwlWalletValidationRules, WrappedComponentProps,
  WalletComponentProps, EmptyProps, EmptyState
} from '../../common/'
import { passwordValidation } from '../../util'
import { UIAuthenticatedEvent, UI_TRIGGER_AUTHENTICATED } from '../../extension'


export const StoreLogin: FunctionComponent<StoreLoginParams> =
  withOwlWallet<StoreLoginProps, StoreLoginNavigator>(
    'StoreLogin',
    ({ t, i18n, alias, navigator, config, renderer: Renderer, extensions }) => {
      const { handler } = useOwlWallet()

      if (!handler.stores[alias]) {
        useEffect(() => { navigator?.home() })
      }

      const _props: StoreLoginImplProps = {
        t,
        i18n,

        name: handler.stores[alias] && handler.stores[alias].name,

        rules: storeLoginValidationRules,

        form: {
          mode: 'onChange',
          criteriaMode: 'all',
          defaultValues: { login: { password: '' } }
        },

        login: (methods, crypto) => async (data: StoreLoginFields) => {
          const loading = await navigator?.invokeLoading()
          try {
            await handler.loadStore(async (handler) => {
              return await buildWalletWrapper(
                { crypto, extensions: extensions?.registry },
                data.login.password,
                handler.stores[alias],
                {
                  prefix: config.DID_PREFIX,
                  defaultSchema: config.baseSchemaUrl,
                  didSchemaPath: config.DID_SCHEMA_PATH,
                }
              )
            })

            if (handler.wallet != null) {
              extensions?.triggerEvent<UIAuthenticatedEvent>(handler.wallet, UI_TRIGGER_AUTHENTICATED, { extensions , handler })
            }

            if (navigator?.success) {
              navigator?.success()
            }
          } catch (e) {
            methods.setError('login.alert', { type: 'wrong', message: e.message || e })
          } finally {
            loading?.finish()
          }
        },

        list: () => navigator?.list()
      }

      return <Renderer {..._props} />
    },
    { namespace: 'owlmeans-wallet-store' }
  )

export const storeLoginValidationRules: OwlWalletValidationRules = {
  'login.password': passwordValidation
}

export type StoreLoginParams = {
  alias: string
} & EmptyProps

export type StoreLoginProps = WalletComponentProps<
  StoreLoginParams, StoreLoginImplParams, EmptyState, StoreLoginNavigator
>

export type StoreLoginImplParams = {
  name: string
  login: (
    methods: UseFormReturn<StoreLoginFields>,
    crypto: CryptoHelper
  ) => (data: StoreLoginFields) => Promise<void>
  list: () => void
}

export type StoreLoginImplProps = WrappedComponentProps<StoreLoginImplParams>

export type StoreLoginFields = {
  login: {
    password: string
    alert: string
  }
}

export type StoreLoginNavigator = BasicNavigator & {
  success: WalletNavigatorMethod<{}>
  list: WalletNavigatorMethod<undefined>
}