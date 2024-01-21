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

import { MaybeArray } from "../../common"
import { WalletWrapper } from "../../wallet"
import { CredentialService, Extension } from "../ext"
import { CredentialDescription, EventParams, ExtensionEvent } from "../schema"

export interface ExtensionRegistry<Ext extends Extension = Extension> {
  extensions: Ext[],
  registerAll: (exts: Ext[]) => Promise<void>
  getExtensions: (type: MaybeArray<string>) => Ext[]
  getExtension: (type: MaybeArray<string>, code?: string) => Ext
  getFactory: (type: MaybeArray<string>) => CredentialService
  getCredentialDescription: (type: string | string[]) => CredentialDescription | undefined
  register: (ext: Ext) => Promise<void>
  registerSync: (ext: Ext) => void
  getObservers: (event: MaybeArray<string>) => [ExtensionEvent, Ext][]
  triggerEvent: TriggerEventMethod
  normalize: () => ExtensionRegistry<Extension>
}

export type TriggerEventMethod = <Params extends EventParams = EventParams>(
  wallet: WalletWrapper, event: MaybeArray<string>, params?: Params
) => Promise<void>

export const ERROR_NO_EXTENSION = 'ERROR_NO_EXTENSION'
