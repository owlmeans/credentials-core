import { EXTENSION_TRIGGER_INIT_SENSETIVE, ExtensionDetails, InitSensetiveEventParams, addObserverToSchema } from '@owlmeans/vc-core'
import { BuildExtensionParams, buildIdentityExtension } from '../ext'
import { OWLMEANS_IDENTITY_DEFAULT_NAMESPACE, OWLMEANS_IDENTITY_DEFAULT_TYPE } from '../types'
import { ExtensionItemPurpose, UIAuthenticatedEvent, UIExtensionFactoryProduct, UI_TRIGGER_AUTHENTICATED, buildUIExtension } from '@owlmeans/vc-lib-react/dist/shared'

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

  extension.schema = addObserverToSchema(extension.schema, {
    trigger: UI_TRIGGER_AUTHENTICATED,
    method: async (wallet, params: UIAuthenticatedEvent) => {
      await params.extensions?.triggerEvent<InitSensetiveEventParams>(
        wallet, EXTENSION_TRIGGER_INIT_SENSETIVE, { extensions: params.extensions.registry }
      )
      params.handler.notify()
    }
  })

  const uiExt = buildUIExtension(
    extension,
    (_purpose: ExtensionItemPurpose, __type?: IdentityCredentials) => {
      return [] as UIExtensionFactoryProduct<{}>[]
    }
  )

  return uiExt
}
