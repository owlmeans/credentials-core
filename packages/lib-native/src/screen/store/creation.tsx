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
import { NavigatorContextProvider, STORE_CREATION_MENU_IMPORT, StoreCreation, StoreCreationNavSuccess, StoreCreationNavigator, WalletNavigatorMethod, useNavigator } from '@owlmeans/vc-lib-react/dist/shared'
import { FC } from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { RootNavigationParams } from '../../router/types'

export const StoreCreateScreen: FC = () => {
  const navigation: NativeStackNavigationProp<RootNavigationParams> = useNavigation()

  const nav = useNavigator<StoreCreationNavigator>({
    success: (async (params: StoreCreationNavSuccess): Promise<void> => {
      navigation.navigate('store.login', params)
    }) as WalletNavigatorMethod<StoreCreationNavSuccess>,

    menu: async location => {
      switch (location) {
        default:
        case STORE_CREATION_MENU_IMPORT:
          navigation.navigate('store.list')
      }
    }
  })

  return <NavigatorContextProvider navigator={nav}>
    <StoreCreation defaultAlias="user" />
  </NavigatorContextProvider>
}
