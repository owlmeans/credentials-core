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

import { FunctionComponent } from 'react'
import { WalletComponentProps, withOwlWallet, WrappedComponentProps } from '../../common/'


export const MainDashboard: FunctionComponent<MainDashboardParams> = withOwlWallet<
  MainDashboardProps
>('MainDashboard', props => {
  const { t, i18n } = props
  const _props: MainDashboardImplProps = {
    t, i18n
  }

  return <props.renderer {..._props} />
}, { namespace: 'owlmeans-wallet-main' })

export type MainDashboardProps = WalletComponentProps<MainDashboardParams, MainDashboardImplParams>

export type MainDashboardParams = {}

export type MainDashboardImplParams = {}

export type MainDashboardImplProps = WrappedComponentProps<MainDashboardImplParams>