import { ExtensionItemPurpose, UIAuthenticatedEvent, UIExtensionFactoryProduct, UI_TRIGGER_AUTHENTICATED, buildUIExtension } from '@owlmeans/vc-lib-react/dist/shared'
import { buildCommExtension } from '../ext'
import { CommExtConfig } from '../types'
import { addObserverToSchema } from '@owlmeans/vc-core'
import { handleIncommingCommDocuments } from '../utils'

export const buildCommNativeExtension = (config: CommExtConfig) => {
  const commExtension = buildCommExtension(config)

  commExtension.schema = addObserverToSchema(commExtension.schema, {
    trigger: UI_TRIGGER_AUTHENTICATED,
    method: async (_, { handler, extensions }: UIAuthenticatedEvent) => {
      // @TODO Do not forget to unregister it on logout
      handleIncommingCommDocuments(handler, extensions?.registry)
    }
  })

  const uiExtension = buildUIExtension(commExtension, (_purpose: ExtensionItemPurpose) => {
    return [] as UIExtensionFactoryProduct<{}>[]
  })

  return uiExtension
}
