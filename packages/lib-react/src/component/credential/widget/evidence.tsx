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

import { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { withOwlWallet } from '../../../common/context'
import {
  EmptyImplProps, EmptyProps, WalletComponentProps, useOwlWallet, WrappedComponentProps
} from '../../../common/'
import { Credential } from '@owlmeans/vc-core'
import { normalizeValue } from '@owlmeans/vc-core'
import { EXTENSION_TRIGGER_RETRIEVE_NAME, RetreiveNameEventParams } from '@owlmeans/vc-core'


export const CredentialEvidenceWidget: FunctionComponent<EvidenceWidgetParams> = withOwlWallet<EvidenceWidgetProps>(
  'CredentialEvidenceWidget', ({ t, i18n, credential, isChild, renderer: Renderer }) => {
    const evidence = normalizeValue(credential.evidence)
    const { extensions, handler } = useOwlWallet()
    const [names, setNames] = useState<string[]>(new Array(evidence.length).fill(''))
    useEffect(() => {
      (async () => {
        if (extensions) {
          const newNames = new Array(evidence.length).fill('')
          await Promise.all(evidence.map(
            async (evidence, idx) => handler.wallet && extensions.triggerEvent<RetreiveNameEventParams>(
              handler.wallet, EXTENSION_TRIGGER_RETRIEVE_NAME, {
              credential: evidence as Credential, setName: (name: string) => { newNames[idx] = name }
            })
          ))
          setNames(newNames)
        }
      })()
    }, [credential.id])

    const props: EvidenceWidgetImplProps = {
      t, i18n, isChild, tabs: []
    }

    if (credential.evidence) {
      props.tabs = evidence.map((evidence, idx) => ({
        idx,
        title: names[idx].trim() !== '' ? names[idx] : `${t('widget.evidence.tabs.title')} ${idx}`,
        evidence: evidence as Credential
      }))

      return <Renderer {...props} />
    }

    return <Fragment />
  }, { namespace: 'owlmeans-wallet-credential' })

export type EvidenceWidgetParams = EmptyProps & {
  credential: Credential
  isChild?: boolean
}

export type EvidenceWidgetProps = WalletComponentProps<EvidenceWidgetParams, EvidenceWidgetImplParams>

export type EvidenceWidgetImplParams = EmptyImplProps & {
  tabs: EvidenceTab[]
  isChild?: boolean
}

export type EvidenceTab = {
  idx: number
  title: string
  evidence: Credential
}

export type EvidenceWidgetImplProps = WrappedComponentProps<EvidenceWidgetImplParams>
