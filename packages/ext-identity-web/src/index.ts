import {
  ExtensionDetails,
  ExtensionItemPurpose,
  EXTESNION_TRIGGER_AUTHENTICATED
} from '@owlmeans/regov-ssi-extension'

import { buildIdentityExtension } from '@owlmeans/regov-ext-identity'

import en from './i18n/en.json'
import {
  buildUIExtension,
  UIExtensionFactoryProduct
} from '@owlmeans/regov-lib-react'


export const REGOV_IDENTITY_DEFAULT_NAMESPACE = 'regov-ext-basic-identity'

export const REGOV_IDENTITY_DEFAULT_TYPE = 'OwlMeans:Regov:Identity'

export const buildIdentityExtensionUI = <CredType extends string>(
  type: CredType,
  details: ExtensionDetails,
  ns = REGOV_IDENTITY_DEFAULT_NAMESPACE
) => {
  const identityType = type || REGOV_IDENTITY_DEFAULT_TYPE
  type IdentityCredentials = typeof identityType

  const extension = buildIdentityExtension(type, {
    ...details,
    name: details.name === '' ? 'extension.details.name' : details.name,
  })

  extension.localization = { ns, translations: {} }
  if (ns === REGOV_IDENTITY_DEFAULT_NAMESPACE) {
    extension.localization.translations.en = en
  }

  if (extension.schema.events) {
    extension.getEvents(EXTESNION_TRIGGER_AUTHENTICATED)[0].method = async (_, __) => {
      console.log('observer called')
    }
  }

  const uiExt = buildUIExtension<IdentityCredentials>(
    extension,
    (__: ExtensionItemPurpose, _?: IdentityCredentials) => {

      return [] as UIExtensionFactoryProduct<{}>[]
    }
  )

  return uiExt
}