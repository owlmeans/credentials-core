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
import * as React from 'react'
import { buildWalletWrapper, createWalletHandler, cryptoHelper } from '@owlmeans/vc-core'
import { useMemo, StrictMode } from 'react'

import { i18nDefaultOptions } from '@owlmeans/vc-lib-react/dist/i18n'
import { nativeComponentMap } from '../component'
import I18n, { InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { OwlWalletProvider } from '@owlmeans/vc-lib-react/dist/common/context'
import CryptoLoader from '../crypto-loader'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { NavigationRoot, createRootNavigator } from '../router'
import { useNavigation } from '@react-navigation/native'
import { RootNavigationProps } from '../router/types'

export const i18nSetup = (options: InitOptions) => {
  const i18n = I18n.createInstance({ ...options, compatibilityJSON: 'v3' })
  i18n.use(initReactI18next).init()

  return i18n
}

const i18n = i18nSetup(i18nDefaultOptions)

export const DebugSSIView = () => {
  const handler = useMemo(createWalletHandler, [])

  const navigation = useNavigation<RootNavigationProps>()
  const navigator = createRootNavigator(navigation, handler, { DID_PREFIX: 'exm', code: 'rn-test' })

  return <StrictMode>
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <CryptoLoader onFinish={() => {
          (async () => {
            console.log('GET ASYNC')
            try {
              const wallet = await buildWalletWrapper(
                { crypto: cryptoHelper }, '11111111', { alias: 'default', name: 'Development wallet' }, {
                prefix: 'exm',
                defaultSchema: 'https://schema.owlmeans.com',
                didSchemaPath: 'did-schema.json',
              })
              handler.wallet = wallet
              handler.stores[wallet.store.alias] = await wallet.export()
              await handler.loadStore(async _ => wallet)
            } catch (e) {
              console.error((e as Error).stack)
            }
          })()
        }} />
        <OwlWalletProvider map={nativeComponentMap} handler={handler}
          config={{ DID_PREFIX: 'exm', code: 'rn-test' }} navigator={navigator} i18n={i18n}>
          <NavigationRoot />
        </OwlWalletProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  </StrictMode>
}
