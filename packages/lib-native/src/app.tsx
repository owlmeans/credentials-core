import _PolyfillCrypto from 'react-native-webview-crypto'
import { FC, useEffect, useMemo, useState } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import I18n, { InitOptions, i18n as Ti18n } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { createWalletHandler } from '@owlmeans/vc-core'
import { i18nDefaultOptions } from '@owlmeans/vc-lib-react/dist/i18n'

import { useNavigation } from '@react-navigation/native'
import { RootNavigationProps } from './router/types'
import { NavigationRoot, createRootNavigator } from './router'
import { Grid, nativeComponentMap } from './component'
import { Config, CryptoLoaderProps, OwlWalletProvider, ServerClient, UIExtensionRegistry } from '@owlmeans/vc-lib-react/dist/shared'
import { buildStorageHelper } from './storage'
import { ActivityIndicator } from 'react-native-paper'

export const PolyfillCrypto = _PolyfillCrypto

export const i18nSetup = (options: InitOptions) => {
  const i18n = I18n.createInstance({ ...options, compatibilityJSON: 'v3' })
  i18n.use(initReactI18next).init()

  return i18n
}

export let i18n: Ti18n

let i18nInitialized: boolean = false

export const i18nRegisterExtensions = (extensions: UIExtensionRegistry, _i18n?: Ti18n) => {
  if (i18nInitialized) {
    return
  }
  if (_i18n == null) {
    _i18n = i18nSetup(i18nDefaultOptions)
  }
  i18n = _i18n
  i18nInitialized = true
  extensions?.uiExtensions.forEach((ext) => {
    if (ext.extension.localization) {
      Object.entries(ext.extension.localization.translations).forEach(([lng, resource]) => {
        if (_i18n != null && ext.extension.localization?.ns) {
          _i18n.addResourceBundle(lng, ext.extension.localization?.ns, resource, true, true)
        }
      })
    }
  })
}


/**
 * WalletApp Component
 * 
 * Is used to be a root compononent for custom react based web app that
 * are based on OwlMeans Credentials.
 */
export const WalletApp: FC<WalletAppParams> = ({ config, CryptoLoader, extensions, serverClient }) => {
  const handler = useMemo(createWalletHandler, [])
  const storage = useMemo(() => buildStorageHelper(handler), [config])

  useEffect(() => extensions && i18nRegisterExtensions(extensions, i18n), extensions?.uiExtensions || [])

  const navigation = useNavigation<RootNavigationProps>()
  const navigator = createRootNavigator(navigation, handler, config)

  const [loaded, setLoaded] = useState(false)

  return <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
      <CryptoLoader onFinish={() => {
        console.log('>>> Crypto loading finished <<<')
        storage.init().then(
          async _ => {
            console.info('STORE INITIALIZED')
            setLoaded(true)
          }
        )

        return () => {
          console.info('STORE DETACHED')
          storage.detach()
        }
      }} />
      {
        loaded
          ? <OwlWalletProvider
            map={nativeComponentMap}
            serverClient={serverClient}
            handler={handler}
            config={config}
            navigator={navigator}
            i18n={i18n}
            extensions={extensions}>
            <NavigationRoot />
          </OwlWalletProvider>
          : <Grid>
            <ActivityIndicator size="large" />
          </Grid>
      }
    </SafeAreaView>
  </SafeAreaProvider>
}

export interface WalletAppParams {
  config: Config
  extensions?: UIExtensionRegistry
  serverClient?: ServerClient
  CryptoLoader: FC<CryptoLoaderProps>
}
