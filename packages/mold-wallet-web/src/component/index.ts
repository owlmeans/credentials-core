
export * from './common'
export * from './credential'

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
  CredentialListWeb,
  CredentialProcessorWeb
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
  'CredentialProcessor': CredentialProcessorWeb,
  'MainAuthArea': MainAuthAreaWeb,
}