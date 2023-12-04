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

import { FC } from 'react'

import { REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES } from '@owlmeans/vc-core'
import { CredentialListItemImplProps, CredentialListItemProps } from '../types'
import { useOwlWallet } from '../../../common'
import { EXTENSION_ITEM_PURPOSE_ITEM } from '../../../extension'

export const CredentialListItem: FC<CredentialListItemProps> = ({ wrapper, props, meta }) => {
  const { extensions, map } = useOwlWallet()

  const renderers = extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_ITEM, wrapper.credential.type)

  const metaItem = {
    id: wrapper.credential.id,
    registry: meta?.tab || REGISTRY_TYPE_IDENTITIES,
    section: meta?.section || REGISTRY_SECTION_PEER
  }

  let Renderer: FC<CredentialListItemImplProps>
  if (renderers && renderers.length > 0) {
    Renderer = renderers[0].com
  } else if (map["CredentialListItem"] == null) {
    return <></>
  } else {
    Renderer = map["CredentialListItem"]
  }

  const hint = wrapper.credential.type.join(', ')
  const status = `list.item.${wrapper.credential.proof ? 'signed' : 'unsigned'}`

  return <Renderer props={props} hint={hint} status={status} wrapper={wrapper} 
    trigger={wrapper.credential.id === props.id} meta={metaItem} />
}
