import { FC, useMemo } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import I18n, { InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { buildWalletWrapper, createWalletHandler, cryptoHelper } from '@owlmeans/vc-core'
import { i18nDefaultOptions } from '@owlmeans/vc-lib-react/dist/i18n'

import { useNavigation } from '@react-navigation/native'
import { RootNavigationProps } from './router/types'
import { NavigationRoot, createRootNavigator } from './router'
import { nativeComponentMap } from './component'
import { Config, CryptoLoaderProps, OwlWalletProvider, ServerClient, UIExtensionRegistry } from '@owlmeans/vc-lib-react/dist/shared'

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
export const WalletApp: FC<WalletAppParams> = ({ config, CryptoLoader }) => {
  const handler = useMemo(createWalletHandler, [])

  const navigation = useNavigation<RootNavigationProps>()
  const navigator = createRootNavigator(navigation, handler)

  return <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
      <CryptoLoader onFinish={() => {
        (async () => {
          console.log('GET ASYNC')
          try {
            const wallet = await buildWalletWrapper(
              { crypto: cryptoHelper },
              '11111111',
              { alias: 'default', name: 'Development wallet' }, {
              prefix: config.DID_PREFIX,
              defaultSchema: config.baseSchemaUrl,
              didSchemaPath: config.DID_SCHEMA_PATH,
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
}

export interface WalletAppParams {
  config: Config
  extensions?: UIExtensionRegistry
  serverClient?: ServerClient
  CryptoLoader: FC<CryptoLoaderProps>
}