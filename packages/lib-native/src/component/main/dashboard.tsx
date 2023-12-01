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
import { EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET, MainDashboardImplProps, useOwlWallet } from '@owlmeans/vc-lib-react/dist/shared'
import { FC } from 'react'
import { View } from 'react-native'

export const MainDashboardNative: FC<MainDashboardImplProps> = () => {
  const { extensions } = useOwlWallet()
  return <>{
    extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET).map(
      (ext, idx) => <View key={idx}><ext.com /></View>
    )
  }</>
}
