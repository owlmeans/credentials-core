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

import { FC, Fragment } from 'react'
import { CredentialListImplProps, CredentialListItem } from '../../../shared'
import { SimpleList } from '../common'
import { CredentialListHeaderAction } from './list-coms/header-action'
import { REGISTRY_SECTION_OWN } from '@owlmeans/vc-core'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

export const CredentialListWeb: FC<CredentialListImplProps> = (props) => {
  const { credentials, tabs, t, tab, section } = props
  const currentTab = tabs.find(_tab => _tab.name === tab) || tabs[0]

  return <Fragment>
    <Box>
      <Tabs value={tab} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
        sx={{ maxWidth: window.innerWidth * 0.80 }}
        onChange={(_, tab) => props.switchTab(tab)}>
        {tabs.map(
          tab => <Tab key={tab.name} value={tab.registry.type} label={`${t(`list.tab.${tab.name}.label`)}`} />
        )}
      </Tabs>
      <Divider />
    </Box>
    <SimpleList {...props} title={`list.header.${currentTab.name}.${section}.title`} headerAction={
      <CredentialListHeaderAction {...props} details={currentTab}
        section={section || REGISTRY_SECTION_OWN}
        action={props.binarySectionSwitch} />
    }>
      {credentials.map(
        wrapper => <CredentialListItem key={wrapper.credential.id} wrapper={wrapper} props={props}
          meta={{ tab: tab, section: section }} />
      )}
    </SimpleList>
  </Fragment>
}

// const CredentialListItem = ({ wrapper, props, meta }: CredentialListItemProps) => {
//   const { t, i18n } = props
//   const { extensions } = useOwlWallet()

//   const credHint = wrapper.credential.type.join(', ')
//   const signStatus = `list.item.${wrapper.credential.proof ? 'signed' : 'unsigned'}`
//   const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [wrapper.credential.id])

//   const renderers = extensions?.produceComponent(EXTENSION_ITEM_PURPOSE_ITEM, wrapper.credential.type)

//   const metaItem = {
//     id: wrapper.credential.id,
//     registry: meta?.registry || REGISTRY_TYPE_IDENTITIES,
//     section: meta?.section || REGISTRY_SECTION_PEER
//   }

//   if (renderers && renderers.length > 0) {
//     const renderer = renderers[0]
//     const Renderer = renderer.com as FunctionComponent<PurposeListItemParams>

//     return <Renderer wrapper={wrapper} trigger={wrapper.credential.id === props.id} meta={metaItem} />
//   }

//   return <SimpleListItem {...props} noTranslation label={wrapper.meta.title || t('list.item.unknown')}
//     hint={`${credHint} - ${t(signStatus)}`}>
//     <MenuIconButton handle={handle} />
//     <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
//       exportTitle={`${wrapper.meta.title}.group`} meta={metaItem} />
//   </SimpleListItem>
// }

// type CredentialListItemProps = {
//   wrapper: CredentialWrapper
//   meta?: Partial<ItemMenuMeta>
//   props: CredentialListImplProps
// }
