/**
 *  Copyright 2024 OwlMeans
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
import { EXTENSION_ITEM_PURPOSE_ROUTE } from '@owlmeans/vc-lib-react/dist/shared'
import { ExtensionRouteProducerParams } from './types'
import { useRoute } from '@react-navigation/native'

export const produceExtensionRoutes = ({ extensions, routeType, Route, t }: ExtensionRouteProducerParams) => {
  return extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_ROUTE, routeType).map(ext => {
    const Renderer = () => {
      const params = useRoute()
      return <ext.com {...params.params} />
    }
    return ext.params && ext.params.path && <Route.Screen key={`${ext.extensionCode}-${ext.params.path}`}
      name={ext.params.path as string} component={Renderer} options={{
        title: `${t(`route.${ext.params.path}`, { ns: ext.params.ns as string ?? undefined })}`
      }}
    />
  })
}
