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
import { WalletHandler } from '@owlmeans/vc-core'
import { basicNavigator, extendNavigator } from '@owlmeans/vc-lib-react/dist/shared'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { FC } from 'react'
import { StoreListScreen } from '../screen'
import { RootNavigationProps } from './types'
import { StoreCreateScreen } from '../screen/store/create'
import { useTranslation } from 'react-i18next'

export const NavigationRoot: FC = () => {
  const Stack = createNativeStackNavigator()
  const { t: ts } = useTranslation('owlmeans-wallet-store')

  return <Stack.Navigator>
    <Stack.Screen name="store.list" component={StoreListScreen} options={{
      title: `${ts('list.title')}`
    }} />
    <Stack.Screen name="store.create" component={StoreCreateScreen} options={{
      title: `${ts('creation.title')}`
    }} />
  </Stack.Navigator>
}

export const createRootNavigator = (
  navigation: RootNavigationProps, _: WalletHandler
) =>
  extendNavigator(basicNavigator, {
    assertAuth: async () => {
      navigation.navigate('store.list')
      return true
    }
  })
