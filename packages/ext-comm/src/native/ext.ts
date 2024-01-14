import { ExtensionItemPurpose, UIExtensionFactoryProduct, buildUIExtension } from '@owlmeans/vc-lib-react/dist/shared'
import { buildCommExtension } from '../ext'
import { CommExtConfig } from '../types'

export const buildCommNativeExtension = (config: CommExtConfig) => {
  const commExtension = buildCommExtension(config)

  const uiExtension = buildUIExtension(commExtension, (_purpose: ExtensionItemPurpose) => {
    return [] as UIExtensionFactoryProduct<{}>[]
  })

  return uiExtension
}
