import React, { Fragment, FunctionComponent, useMemo } from 'react'
import { GroupSubject } from '../../../../types'
import { EmptyProps, RegovComponentProps, useRegov, withRegov, ListItemMeta } from '@owlmeans/regov-lib-react'
import {
  Extension, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, IncommigDocumentEventParams
} from '@owlmeans/regov-ssi-core'
import { CredentialWrapper, Credential, CredentialSubject, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { Groups } from '@mui/icons-material'
import { ItemMenu, ItemMenuHandle, MenuIconButton } from '@owlmeans/regov-lib-react'


export const GroupItem = (ext: Extension): FunctionComponent<GroupItemParams> =>
  withRegov<GroupItemProps>({ namespace: ext.localization?.ns }, ({ t, i18n, meta, wrapper, action }) => {
    const subject = getCompatibleSubject<GroupSubject>(wrapper.credential)
    const { extensions, handler } = useRegov()

    const handle: ItemMenuHandle = useMemo(() => ({ handler: undefined }), [wrapper.credential.id])

    action = action || (async () => {
      if (!extensions || !handler.wallet) {
        return
      }

      await extensions.triggerEvent<IncommigDocumentEventParams>(
        handler.wallet, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, {
        credential: wrapper.credential, statusHandler: { successful: false },
        cleanUp: () => undefined
      })
    })

    return <ListItem>
      <ListItemButton onClick={action}>
        <ListItemAvatar>
          <Avatar>
            <Groups />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={wrapper.meta.title || t('group.list.item.unknown')}
          secondary={
            <Fragment>
              <Typography variant="body2" component="span">{subject.name}</Typography>
              <br />
              <Typography variant="caption" component="span">{t('group.list.item.type')}</Typography>
            </Fragment>
          } />
      </ListItemButton>
      <ListItemIcon>
        <MenuIconButton handle={handle} />
        <ItemMenu handle={handle} content={wrapper.credential} i18n={i18n} prettyOutput
          exportTitle={`${wrapper.meta.title}.group`} meta={meta} />
      </ListItemIcon>
    </ListItem>
  })

export type GroupItemParams = EmptyProps & {
  wrapper: CredentialWrapper<CredentialSubject, Credential<CredentialSubject>>
  action?: () => void
  meta?: ListItemMeta
}

export type GroupItemProps = RegovComponentProps<GroupItemParams>

