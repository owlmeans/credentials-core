import { ExtensionDetails } from '@owlmeans/vc-core'
import { BuildExtensionParams, buildIdentityExtension } from '../ext'
import { OWLMEANS_IDENTITY_DEFAULT_NAMESPACE, OWLMEANS_IDENTITY_DEFAULT_TYPE } from '../types'
import { ExtensionItemPurpose, UIExtensionFactoryProduct, buildUIExtension } from '@owlmeans/vc-lib-react/dist/shared'

export const buildIdentityExtensionNative = (
  type: string,
  params: BuildExtensionParams,
  details: ExtensionDetails,
  ns = OWLMEANS_IDENTITY_DEFAULT_NAMESPACE
) => {
  const identityType = type || OWLMEANS_IDENTITY_DEFAULT_TYPE
  type IdentityCredentials = typeof identityType

  const extension = buildIdentityExtension(type, params, {
    ...details,
    name: details.name === '' ? 'extension.details.name' : details.name,
  }, ns)

  const uiExt = buildUIExtension(
    extension,
    (_purpose: ExtensionItemPurpose, __type?: IdentityCredentials) => {
      return [] as UIExtensionFactoryProduct<{}>[]
    }
  )

  return uiExt
}
