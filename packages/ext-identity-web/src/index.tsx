export * from './types'

import React from 'react'
import {
  ExtensionDetails,
  EXTESNION_TRIGGER_AUTHENTICATED,
} from '@owlmeans/regov-ssi-extension'

import {
  BuildExtensionParams,
  buildIdentityExtension
} from '@owlmeans/regov-ext-identity'

import en from './i18n/en.json'
import {
  buildUIExtension,
  UIExtensionFactoryProduct,
  MainModalEventTriggerParams,
  ExtensionItemPurpose,
  EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET,
} from '@owlmeans/regov-lib-react'
import { DashboardWidget, Onboarding } from './component'
import { REGOV_IDENTITY_DEFAULT_NAMESPACE } from './types'


export const REGOV_IDENTITY_DEFAULT_TYPE = 'OwlMeans:Regov:Identity'

export const buildIdentityExtensionUI = <CredType extends string>(
  type: CredType,
  params: BuildExtensionParams,
  details: ExtensionDetails,
  ns = REGOV_IDENTITY_DEFAULT_NAMESPACE
) => {
  const identityType = type || REGOV_IDENTITY_DEFAULT_TYPE
  type IdentityCredentials = typeof identityType

  const extension = buildIdentityExtension(type, params, {
    ...details,
    name: details.name === '' ? 'extension.details.name' : details.name,
  })

  extension.localization = { ns, translations: {} }
  if (ns === REGOV_IDENTITY_DEFAULT_NAMESPACE) {
    extension.localization.translations.en = en
  }

  if (extension.schema.events) {
    extension.getEvents(EXTESNION_TRIGGER_AUTHENTICATED)[0].method = async (
      _, params: MainModalEventTriggerParams
    ) => {
      params.handle.getContent = () => <Onboarding {...params} ns={ns} ext={extension} />

      if (params.handle.setOpen) {
        params.handle.setOpen(true)
      }

      return true
    }
  }

  const uiExt = buildUIExtension<IdentityCredentials>(
    extension,
    (purpose: ExtensionItemPurpose, _?: IdentityCredentials) => {
      switch (purpose) {
        case EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET:
          return [
            {
              com: DashboardWidget(extension),
              extensionCode: `${details.code}DashboardWidget`,
              params: {},
              order: 0
            }
          ] as UIExtensionFactoryProduct<{}>[]
      }

      return [] as UIExtensionFactoryProduct<{}>[]
    }
  )

  return uiExt
}