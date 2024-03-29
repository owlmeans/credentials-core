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

import { EncryptedStore } from "../store"
import { WalletWrapper } from "./types"
import { MaybeArray } from '../common'
import { EXTENSION_TRIGGER_AUTHENTICATED, EXTENSION_TRIGGER_UNAUTHENTICATED } from '../extension/schema/consts'
import { EventParams } from '../extension/schema/types'

export const createWalletHandler = (): WalletHandler => {
  const _handler: WalletHandler = {
    wallet: undefined,

    stores: {},

    observers: [],

    cryptoLoaded: false,

    observe: <T>(
      setState: Dispatch<SetStateAction<T>>,
      transformer: HandlerObserverTransformer<T>
    ) => {
      const _observer = () => {
        const transformed = transformer(_handler.wallet)
        setState(transformed)
      }
      _handler.observers.push(_observer)
      const idx = _handler.observers.length - 1

      return () => {
        delete _handler.observers[idx]
      }
    },

    notify: () => {
      _handler.observers.forEach(observer => observer && observer())
    },

    logout: async () => {
      await _handler.emit(EXTENSION_TRIGGER_UNAUTHENTICATED)
      await _handler.loadStore(async () => undefined)
    },

    loadStore: async (loader) => {
      const prev = _handler.wallet
      _handler.wallet = await loader(_handler)
      void _handler.emit(EXTENSION_TRIGGER_AUTHENTICATED)
      _handler.notify()

      return prev
    },

    emit: async (event, params) => {
      if (_handler.wallet != null) {
        await _handler.wallet.getExtensions()?.triggerEvent(_handler.wallet, event, params)
      }
    }
  }

  return _handler
}

export type WalletHandler = {
  wallet?: WalletWrapper,

  stores: { [key: string]: EncryptedStore },

  observers: HandlerObserver[]

  cryptoLoaded: boolean

  notify: () => void

  logout: () => Promise<void>

  observe: <T>(
    setState: Dispatch<SetStateAction<T>>,
    transformer: HandlerObserverTransformer<T>
  ) => () => void

  loadStore: (loader: StoreLoader) => Promise<WalletWrapper | undefined>

  emit: <
    Params extends EventParams = EventParams
  >(event: MaybeArray<string>, params?: Params) => Promise<void>
}

export type StoreLoader = (hanlder: WalletHandler) => Promise<WalletWrapper | undefined>

export type HandlerObserver = () => void

export type ObserverTransformerOption<
  T extends any = any,
  Props extends any = any
> = (wallet: WalletWrapper | undefined, props?: Props, handler?: WalletHandler) => T

export type HandlerObserverTransformer<T> = (wallet?: WalletWrapper) => T

type Dispatch<A> = (value: A) => void
type SetStateAction<S> = S | ((prevState: S) => S)
