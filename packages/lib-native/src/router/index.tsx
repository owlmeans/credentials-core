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
import { Config, MainDashboard, basicNavigator, extendNavigator, useOwlWallet } from '@owlmeans/vc-lib-react/dist/shared'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { FC } from 'react'
import { StoreListScreen, StoreLoginScreen } from '../screen'
import { RootNavigationProps } from './types'
import { StoreCreateScreen } from '../screen/store/creation'
import { useTranslation } from 'react-i18next'
import { produceExtensionRoutes } from './ext-routes'
import { NATIVE_ROUTER_TYPE_DRAWER, NATIVE_ROUTER_TYPE_STACK } from './consts'

export const NavigationRoot: FC = () => {
  const { extensions } = useOwlWallet()
  const Stack = createNativeStackNavigator()
  const { t: ts } = useTranslation('owlmeans-wallet-store')

  return <Stack.Navigator>
    <Stack.Screen name="store.list" component={StoreListScreen} options={{ title: `${ts('list.title')}` }} />
    <Stack.Screen name="store.create" component={StoreCreateScreen} options={{ title: `${ts('creation.title')}` }} />
    <Stack.Screen name="store.login" component={StoreLoginScreen} options={
      ({ route }) => ({ title: `${ts('login.title', { name: (route.params as any).alias })}` })
    } />
    <Stack.Screen name="home" component={NavigationHome} options={{ headerShown: false }} />
    {produceExtensionRoutes({ extensions, t: ts, Route: Stack, routeType: NATIVE_ROUTER_TYPE_STACK })}
  </Stack.Navigator>
}

export const NavigationHome: FC = () => {
  const { extensions } = useOwlWallet()
  const { t: ts } = useTranslation('owlmeans-wallet-main')
  const Drawer = createDrawerNavigator()
  return <Drawer.Navigator initialRouteName="dashboard" screenOptions={{ headerStatusBarHeight: 0 }}>
    <Drawer.Screen name="dashboard" component={MainDashboard} options={{ title: `${ts('menu.dashboard')}` }} />
    {produceExtensionRoutes({ extensions, t: ts, Route: Drawer, routeType: NATIVE_ROUTER_TYPE_DRAWER })}
  </Drawer.Navigator>
}

export const createRootNavigator = (
  navigation: RootNavigationProps, handler: WalletHandler, config: Config
) =>
  extendNavigator(basicNavigator, {
    assertAuth: async () => {
      if (handler.wallet) {
        return true
      }

      if (!config.development) {
        navigation.navigate('store.list')
      }

      return true
    },

    checkAuth: async () => handler.wallet != null,

    home: async () => navigation.navigate('home'),

    back: async () => navigation.goBack()
  })
