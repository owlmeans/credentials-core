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
import { useEffect, useMemo } from 'react'
import { View, Text } from 'react-native'

import { encodeBase58, decodeBase58, toBeArray, getBytes, sha256, randomBytes, HDNodeWallet } from 'ethers'
import { getCryptoAdapter } from '@owlmeans/vc-core'
import { signSync, verify } from '@noble/secp256k1'
import { i18nDefaultOptions } from '@owlmeans/vc-lib-react/dist/i18n'
import { nativeComponentMap } from '../component'
import I18n, { InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { OwlWalletProvider } from '@owlmeans/vc-lib-react/dist/common/context'
import { basicNavigator } from '@owlmeans/vc-lib-react/dist/common/navigator'

const aes = require('browserify-aes/browser')

export const i18nSetup = (options: InitOptions) => {
  const i18n = I18n.createInstance({ ...options, compatibilityJSON: 'v3' })
  i18n.use(initReactI18next).init()

  return i18n
}

const i18n = i18nSetup(i18nDefaultOptions)

export const DebugSSIView = () => {
  const handler = useMemo(createWalletHandler, [])

  useEffect(() => {
    console.log('START USE EFFECT');
    void (async () => {
      const adapter = getCryptoAdapter()
      adapter.setBase58Impl(encodeBase58, decodeBase58, toBeArray)
      adapter.setSha256Impl(sha256, getBytes)
      adapter.setAesImpl(aes)
      adapter.setRandomImpl(randomBytes)
      adapter.setSecpImpl(signSync, verify);
      adapter.WalletClass = HDNodeWallet as any;
      (async () => {
        console.log('GET ASYNC')
        try {
          handler.wallet = await await buildWalletWrapper(
            { crypto: cryptoHelper }, '11111111', { alias: 'default', name: 'Development wallet' }, {
            prefix: 'exm',
            defaultSchema: 'https://schema.owlmeans.com',
            didSchemaPath: 'did-schema.json',
          })
          console.log(handler.wallet)
        } catch (e) {
          console.error((e as Error).stack)
        }
      })();
    })();
  }, [])


  return <View>
    {/* <OwlWalletContext.Provider value={{ map: nativeComponentMap, handler, config: { DID_PREFIX: 'exm', code: 'rn-test' } }}> */}
    <OwlWalletProvider map={nativeComponentMap} handler={handler}
      config={{ DID_PREFIX: 'exm', code: 'rn-test' }} navigator={basicNavigator} i18n={i18n}>
      <Text>Hello world</Text>
    </OwlWalletProvider>
    {/* </OwlWalletContext.Provider> */}
  </View>
}
