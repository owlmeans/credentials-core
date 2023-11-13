/**
 *  Copyright 2023 OwlMeans
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

import { EXTENSION_TRIGGER_INIT_SENSETIVE, InitSensetiveEventParams, WalletHandler, buildWalletWrapper, createWalletHandler, cryptoHelper, Credential, REGISTRY_TYPE_IDENTITIES, REGISTRY_SECTION_PEER, EXTENSION_TRIGGER_AUTHENTICATED } from '@owlmeans/vc-core'
import { buildStorageHelper } from '../storage'
import { Dispatch, FC, PropsWithChildren, SetStateAction, Suspense, useEffect, useMemo, useState } from 'react'
import { BasicNavigator, Config, ContextParams, EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, MainLoading, MainModalAuthenticatedEventParams, MainModalHandle, MainModalShareEventParams, OwlWalletProvider, ServerClient, UIExtensionRegistry, basicNavigator, extendNavigator, useOwlWallet as useRealWallet } from '../../cmn'
import { webComponentMap } from '../component'
import { i18n, i18nRegisterExtensions } from './persistent'
import { CryptoLoaderProps } from '../../common/crypto'
import { IntegratedWalletPlugin, UneregisterIntegratedWalletPlugin } from './types'
import { getOwlWalletPassword, isOwlWalletPasswordSet } from './utils'

export const useOwlUIContext = (
  config: Config,
  passedHandler?: WalletHandler
): OwlMeansUIContext => {
  const handler = useMemo(() => passedHandler ?? createWalletHandler(), [config])
  const storage = useMemo(() => buildStorageHelper(handler, config), [config])
  const [loading, setLoading] = useState<WalletState>(WalletState.Loading)

  return { handler, storage, loading, setLoading }
}

export const OwlMeansProviderWrapper: FC<OwlMeansProviderWrapperProps> = ({
  handler, config, navigatorBuilder, serverClient, children, integrationConfig, source, plugins,
  setInboxCount
}) => {
  const owlmeans = useIntOwlWallet()
  handler = handler ?? owlmeans.handler
  if (!owlmeans.handler) {
    return <></>
  }
  const navigator = navigatorBuilder ? navigatorBuilder(handler) : extendNavigator(basicNavigator, {})

  const handle = useMemo<MainModalHandle>(
    () => ({ close: () => undefined, upgrade: () => undefined } as unknown as MainModalHandle),
    [source]
  )

  useEffect(() => owlmeans.extensions && i18nRegisterExtensions(i18n, owlmeans.extensions), owlmeans.extensions?.uiExtensions)

  const [oneTime, setOneTime] = useState(true)

  useEffect(() => {
    if (!isOwlWalletPasswordSet() || !plugins) {
      return
    }
    (async () => {
      if (handler && !handler?.wallet) {
        if (!handler?.stores['default']) {
          const wallet = await buildWalletWrapper(
            { crypto: cryptoHelper, extensions: owlmeans.extensions?.registry },
            getOwlWalletPassword() ?? '',
            {
              name: 'Default wallet',
              alias: 'default',
            },
            {
              prefix: config.DID_PREFIX,
              defaultSchema: config.baseSchemaUrl,
              didSchemaPath: config.DID_SCHEMA_PATH,
            }
          )
          await owlmeans.extensions?.triggerEvent<InitSensetiveEventParams>(wallet, EXTENSION_TRIGGER_INIT_SENSETIVE, {
            extensions: owlmeans.extensions.registry,
          })
          handler.stores[wallet.store.alias] = await wallet.export()

          handler.notify()
        }
        await handler.loadStore(async (handler) => {
          return await buildWalletWrapper(
            { crypto: cryptoHelper, extensions: owlmeans.extensions?.registry },
            getOwlWalletPassword() ?? '',
            handler.stores['default'],
            {
              prefix: config.DID_PREFIX,
              defaultSchema: config.baseSchemaUrl,
              didSchemaPath: config.DID_SCHEMA_PATH,
            }
          )
        })
      }

      if (integrationConfig?.trustedIssuersUri && oneTime) {
        setOneTime(false)
        try {
          let credentialList = (await serverClient?.getVCs<Credential[]>({
            uri: integrationConfig.trustedIssuersUri,
            serverAlias: 'integration',
          })) as unknown as { credentials: Credential[] }

          if (!credentialList?.credentials) {
            credentialList = { credentials: [] }
          }

          await Promise.all(
            credentialList.credentials.map(async (credential) => {
              if (!handler?.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential(credential.id, REGISTRY_SECTION_PEER)) {
                await handler?.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES).addCredential(credential, REGISTRY_SECTION_PEER)
              }
            })
          )
          handler?.notify()
        } catch (e) {
          console.error(e)
        }
      }

      if (!handler?.wallet) {
        return
      }

      await owlmeans.extensions?.triggerEvent<MainModalShareEventParams>(handler.wallet, EXTENSION_TIRGGER_MAINMODAL_SHARE_HANDLER, { handle })

      /**
       * @TODO handle should be able to open modals or process incomming VCs some other way
       */
      await owlmeans.extensions?.triggerEvent<MainModalAuthenticatedEventParams>(handler.wallet, EXTENSION_TRIGGER_AUTHENTICATED, {
        handle, config, handler, extensions: owlmeans.extensions
      })

    })()

    const destructors: UneregisterIntegratedWalletPlugin[] = []

    destructors.push(...plugins?.onStorageLoaded?.map(plugin => plugin({
      handler: handler ?? owlmeans.handler, isHandlerPassed: !!handler, isUnregisterSet: true, extensions: owlmeans.extensions, setInboxCount
    })) as [])

    destructors.push(...plugins?.onKickOff?.map(plugin => plugin({
      handler: handler ?? owlmeans.handler, isHandlerPassed: true, isUnregisterSet: true, extensions: owlmeans.extensions, setInboxCount
    })) as [])

    return () => {
      destructors.forEach(destructor => destructor && destructor())
    }
  }, [isOwlWalletPasswordSet(), handler, handler.wallet])

  return (
    <OwlWalletProvider i18n={i18n} map={webComponentMap} handler={handler}
      config={config} navigator={navigator} extensions={owlmeans.extensions} serverClient={serverClient}>
      {children}
      <MainLoading nav={navigator} />
    </OwlWalletProvider>
  )
}

export const sharedOwlMeansContext: Partial<ContextParams> = {};

export const useIntOwlWallet = (): ContextParams => {
  const _context = useRealWallet();

  (Object.keys(_context) as (keyof ContextParams)[]).forEach(<K extends keyof ContextParams>(key: K) => {
    if (sharedOwlMeansContext[key] == null && _context[key] != null) {
      sharedOwlMeansContext[key] = _context[key]
    }
  });

  (Object.keys(sharedOwlMeansContext) as (keyof ContextParams)[]).forEach(<K extends keyof ContextParams>(key: K) => {
    if (_context[key] == null && sharedOwlMeansContext[key] != null) {
      (_context[key] as unknown) = sharedOwlMeansContext[key]
    }
  })

  return sharedOwlMeansContext as ContextParams;
}

export const buildOwlMeansCryptoLoader = ({
  context: { setLoading, handler, storage },
  CryptoLoader, extensions, noSuspense
}: OwlMeansCryptoLoaderParams): FC => {
  sharedOwlMeansContext.extensions = extensions
  const CompoundCryptoLoader = () => {

    const Wrapper: FC<PropsWithChildren> = noSuspense ? ({ children }) => {
      return <>{children}</>
    } : ({ children }) => {
      return <Suspense fallback={<>Loading...</>}>{children}</Suspense>
    }

    return handler.cryptoLoaded ? null : <Wrapper>
      <CryptoLoader deps={extensions?.uiExtensions || []} onFinish={() => {
        if (sharedOwlMeansContext.handler == null) {
          handler.cryptoLoaded = true
          sharedOwlMeansContext.handler = handler
          i18nRegisterExtensions(i18n, extensions)
          storage.init().then(async () => {
            setLoading(handler.stores['default'] ? WalletState.Loaded : WalletState.Empty)
          })
        }
      }} />
    </Wrapper>


  }

  return CompoundCryptoLoader
}

export interface OwlMeansCryptoLoaderParams {
  context: OwlMeansUIContext,
  CryptoLoader: FC<CryptoLoaderProps>
  extensions: UIExtensionRegistry
  noSuspense?: boolean
}

export interface OwlMeansUIContext {
  handler: WalletHandler
  storage: ReturnType<typeof buildStorageHelper>
  loading: string
  setLoading: Dispatch<SetStateAction<WalletState>>
}

export interface OwlMeansProviderWrapperProps extends PropsWithChildren {
  handler?: WalletHandler
  navigatorBuilder?: (handler: WalletHandler) => BasicNavigator
  source?: string
  config: Config,
  serverClient?: ServerClient

  renderSeed?: number
  setInboxCount?: (count: number) => void
  integrationConfig?: {
    trustedIssuersUri?: string
  }
  plugins?: {
    onKickOff?: IntegratedWalletPlugin[]
    onStorageLoaded?: IntegratedWalletPlugin[]
  }
}

export enum WalletState {
  Loading = 'loading',
  Loaded = 'wallet',
  Empty = 'no_wallet',
}
