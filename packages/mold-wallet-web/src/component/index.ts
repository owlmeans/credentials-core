
export * from './common'

import {
  ImplementationMap
} from '@owlmeans/regov-lib-react'
import {
  MainLoadingWeb,
  MainMenuWeb,
  MainDashboardWeb,
  MainModalWeb,
  MainAuthAreaWeb
} from './main'
import {
  StoreCreationWeb,
  StoreLoginWeb,
  StoreListWeb
} from "./store"
import {
  CredentialListWeb
} from './credential'


export const webComponentMap: ImplementationMap = {
  'StoreCreation': StoreCreationWeb,
  'StoreLogin': StoreLoginWeb,
  'MainDashboard': MainDashboardWeb,
  'MainLoading': MainLoadingWeb,
  'MainMenu': MainMenuWeb,
  'StoreList': StoreListWeb,
  'CredentialList': CredentialListWeb,
  'MainModal': MainModalWeb,
  'MainAuthArea': MainAuthAreaWeb,
}