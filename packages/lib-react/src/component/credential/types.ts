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

import { BASE_CREDENTIAL_TYPE, BASE_PRESENTATION_TYPE, CredentialWrapper, RegistryType } from "@owlmeans/vc-core"
import { BasicNavigator, EmptyProps, WalletComponentProps, WalletNavigatorMenuMethod, WrappedComponentProps } from '../../common'
import { PurposeListItemParams } from '../../extension'

export const LIBREACT_HOLDER_ISNT_UNSIGNEDID = 'LIBREACT_HOLDER_ISNT_UNSIGNEDID'

export type VerificationResult = PresentationVerificationResult | CredentialVerificationResult | UnknownVerificationResult

export type PresentationVerificationResult = BaseVerificationResult & {
  type: typeof BASE_PRESENTATION_TYPE
  purpose?: string
  credentials: CredentialVerificationResult[]
}

export type CredentialVerificationResult = BaseVerificationResult & {
  type: typeof BASE_CREDENTIAL_TYPE
  hasEvidence: boolean
  hasSchema: boolean
  selfSigned: boolean
}

export type UnknownVerificationResult = {
  type: 'unknown'
}

export type BaseVerificationResult = {
  valid: boolean
  extension?: string
}

export type CredentialListParams = {
  tabs: CredentialListTab[]
  tab?: RegistryType
  section?: string
  id?: string
} & EmptyProps



export type CredentialListImplParams = EmptyProps & {
  tabs: CredentialListTab[]
  tab?: RegistryType
  section?: string
  id?: string
  binarySectionSwitch: () => void
  switchTab: (tab: string) => void
}

export type CredentialListNavigatorItem = RegistryType
export type CredentialListNavigatorParams = {
  section: string
}

export type CredentialListNavigator = BasicNavigator & {
  menu?: WalletNavigatorMenuMethod<CredentialListNavigatorItem, CredentialListNavigatorParams>
  create?: WalletNavigatorMenuMethod<string>
  request?: WalletNavigatorMenuMethod<string>
  claim?: WalletNavigatorMenuMethod<string>
}

export type CredentialListProps = WalletComponentProps<
  CredentialListParams, CredentialListImplProps, CredentialListState, CredentialListNavigator
>

export type CredentialListState = {
  credentials: CredentialWrapper[]
}

export type CredentialListImplProps = WrappedComponentProps<
  CredentialListImplParams, CredentialListState
>

export type CredentialListTab = {
  name: string
  registry: {
    type: RegistryType
    defaultSection?: string
    allowPeer?: boolean
    sections?: string[]
  }
}

export type CredentialListItemProps = {
  wrapper: CredentialWrapper
  meta?: Partial<CredentialListParams>
  props: CredentialListImplProps
}

export interface CredentialListItemImplProps extends Omit<CredentialListItemProps, "meta">, PurposeListItemParams {
  hint: string
  status: string
}
