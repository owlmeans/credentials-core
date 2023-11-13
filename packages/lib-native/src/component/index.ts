import { ImplementationMap } from '@owlmeans/vc-lib-react/dist/common/index'
import { StoreCreationNative, StoreListNative, StoreLoginNative } from './store'

export const nativeComponentMap: ImplementationMap = {
  "StoreList": StoreListNative,
  "StoreCreation": StoreCreationNative,
  "StoreLogin": StoreLoginNative
}
