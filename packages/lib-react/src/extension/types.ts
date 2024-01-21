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

import { CredentialDescription, CredentialWrapper, EventParams, MaybeArray, RegistryType, WalletHandler } from "@owlmeans/vc-core"
import { EmptyProps, WalletNavigator, BasicNavigator } from "../common"
import {
  EXRENSION_ITEM_PURPOSE_INPUT_ITEM, EXTENSION_ITEM_PURPOSE_CREATION,
  EXTENSION_ITEM_PURPOSE_DASHBOARD, EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET,
  EXTENSION_ITEM_PURPOSE_EVIDENCE, EXTENSION_ITEM_PURPOSE_ITEM,
  EXTENSION_ITEM_PURPOSE_REQUEST, EXTENSION_ITEM_PURPOSE_ROUTE,
  EXTENSION_ITEM_PURPOSE_TOP_ACTION, EXTENSION_ITEM_PURPOSE_VALIDATION
} from './consts'
import { UIExtensionRegistry } from './registry'
import { UIExtension, UIExtensionFactoryProduct } from './extension'
import { FC } from 'react'

export type ExtensionItemPurpose = typeof EXTENSION_ITEM_PURPOSE_ITEM
  | typeof EXTENSION_ITEM_PURPOSE_ROUTE
  | typeof EXTENSION_ITEM_PURPOSE_DASHBOARD
  | typeof EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET
  | typeof EXTENSION_ITEM_PURPOSE_EVIDENCE
  | typeof EXTENSION_ITEM_PURPOSE_VALIDATION
  | typeof EXTENSION_ITEM_PURPOSE_CREATION
  | typeof EXTENSION_ITEM_PURPOSE_REQUEST
  | typeof EXTENSION_ITEM_PURPOSE_TOP_ACTION
  | typeof EXRENSION_ITEM_PURPOSE_INPUT_ITEM
  | string

export interface UIExtensionBuilder {
  ext?: UIExtension
  menuItems: ManuItemParams[]

  addMenu: (tag: MaybeArray<string>, params?: Partial<ManuItemParams>) => ExtensionMenuBuilder
  products: Record<string, Record<string, MaybeArray<UIExtProductMeta>>>
  addComponent: <Params extends EmptyProps>(
    purpose: ExtensionItemPurpose, component: UIExtensionFC<Params>, path?: string, type?: MaybeArray<string>
  ) => void
  addRenderer: (
    purpose: ExtensionItemPurpose, product: UIExtensionFactoryProduct, type?: MaybeArray<string>
  ) => void
  build: () => UIExtension
}

export interface UIExtProductMeta {
  product: UIExtensionFactoryProduct
  type: MaybeArray<string>
}

export interface ExtensionMenuBuilder {
  addItem: (title: string, action: MenuItemAction, params?: Partial<ManuItemParams>) => void
}

export interface UIExtensionFC<Params extends EmptyProps = EmptyProps> extends FC<Params> { }

export type ManuItemParams = {
  title: string
  action: MenuItemAction
  ns?: string
  order?: number
  menuTag?: string | string[]
}

export type MenuItemAction = (() => Promise<void | MenuActionResult> | MenuActionResult | void)
| MenuActionResult
| string

export type MenuActionResult = { path: string, params?: Object }

export type PurposeListItemParams = EmptyProps & {
  wrapper: CredentialWrapper
  trigger?: boolean
  meta?: ListItemMeta
}

export type ListItemMeta = {
  id: string
  registry: RegistryType
  section: string
}

export type PurposeEvidenceWidgetParams = EmptyProps & {
  wrapper: CredentialWrapper
}

export type PurposeCredentialCreationParams = EmptyProps & {
  next: () => void
}

export type PurposeDashboardWidgetParams = EmptyProps & { }

export type ClaimNavigator = WalletNavigator<ClaimNavigatorParams> & BasicNavigator

export type ClaimNavigatorParams = {
  path?: string
  descr: CredentialDescription
  id?: string
  issuer?: string
}

export interface UIAuthenticatedEvent extends EventParams {
  extensions?: UIExtensionRegistry
  handler: WalletHandler
}
