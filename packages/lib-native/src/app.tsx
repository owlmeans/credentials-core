import { FC, useMemo, useState } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import I18n, { InitOptions } from 'i18next'
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

export const i18nSetup = (options: InitOptions) => {
  const i18n = I18n.createInstance({ ...options, compatibilityJSON: 'v3' })
  i18n.use(initReactI18next).init()

  return i18n
}

const i18n = i18nSetup(i18nDefaultOptions)

/**
 * WalletApp Component
 * 
 * Is used to be a root compononent for custom react based web app that
 * are based on OwlMeans Credentials.
 */
export const WalletApp: FC<WalletAppParams> = ({ config, CryptoLoader, extensions, serverClient }) => {
  const handler = useMemo(createWalletHandler, [])
  const storage = useMemo(() => buildStorageHelper(handler), [config])

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