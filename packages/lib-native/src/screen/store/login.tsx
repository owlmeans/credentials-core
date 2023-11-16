import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { FC } from 'react'
import { RootNavigationParams } from '../../router/types'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NavigatorContextProvider, StoreLogin, StoreLoginNavigator, useNavigator } from '@owlmeans/vc-lib-react/dist/shared'

export const StoreLoginScreen: FC = () => {
  const navigation: NativeStackNavigationProp<RootNavigationParams> = useNavigation()
  const route = useRoute<RouteProp<RootNavigationParams, 'store.login'>>()

  const nav = useNavigator<StoreLoginNavigator>({
    success: async () => { navigation.navigate('home') },

    list: async () => { navigation.navigate('store.list') }
  })

  return <NavigatorContextProvider navigator={nav}>
    <StoreLogin alias={route.params.alias ?? ""} />
  </NavigatorContextProvider>
}
