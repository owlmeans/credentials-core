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
import { useNavigate, useParams } from 'react-router-dom-owlmeans'
import { NavigatorContextProvider, StoreLogin, StoreLoginNavigator, useNavigator } from '../../../shared'

export const WalletStoreLogin = () => {
  const { alias } = useParams()
  const navigate = useNavigate()
  const nav = useNavigator<StoreLoginNavigator>({
    success: async () => { navigate('/') },

    list: async () => { navigate('/store/list') }
  })

  return <NavigatorContextProvider navigator={nav}>
    <StoreLogin alias={alias || 'citizen'} />
  </NavigatorContextProvider>
}
