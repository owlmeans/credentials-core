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

import {
  GroupSubject, MembershipSubject, OwlMeansGroupExtension, OWLMEANS_CREDENTIAL_TYPE_GROUP,
  OWLMEANS_CREDENTIAL_TYPE_MEMBERSHIP, OWLMEANS_EXT_GROUP_NAMESPACE, OWLMEANS_GROUP_CHAINED_TYPE,
  OWLMEANS_GROUP_CLAIM_TYPE, OWLMEANS_MEMBERSHIP_OFFER_TYPE
} from '../../../../types'
import { getGroupFromMembershipClaimPresentation, getMembershipClaim, getMembershipClaimHolder } from '../../../../util'
import { EmptyProps, generalNameVlidation, WalletComponentProps, useOwlWallet, withOwlWallet } from '@owlmeans/vc-lib-react'
import {
  getCompatibleSubject, Presentation, Credential, normalizeValue, REGISTRY_SECTION_OWN,
  REGISTRY_TYPE_IDENTITIES, REGISTRY_SECTION_PEER
} from '@owlmeans/vc-core'
import {
  AlertOutput, CredentialActionGroup, dateFormatter, LongTextInput, MainTextInput, MainTextOutput,
  PrimaryForm, WalletFormProvider
} from '@owlmeans/vc-lib-react'
import { useForm } from 'react-hook-form'
import { ERROR_MEMBERSHIP_READYTO_CLAIM, ERROR_WIDGET_AUTHENTICATION } from '../../types'
import { EXTENSION_TRIGGER_RETRIEVE_NAME, RetreiveNameEventParams } from '@owlmeans/vc-core'
import { singleValue, addToValue } from '@owlmeans/vc-core'

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import { CommConnectionStatusHandler, DIDCommConnectMeta, getDIDCommUtils } from '@owlmeans/vc-comm'
import { REGISTRY_TYPE_INBOX } from '@owlmeans/vc-ext-comm'


export const MembershipOffer: FunctionComponent<MembershipOfferParams> = withOwlWallet<MembershipOfferProps>(
  { namespace: OWLMEANS_EXT_GROUP_NAMESPACE }, (props) => {
    const { credential: presentation, navigator, ext, close, t, i18n, conn } = props
    const { handler, extensions } = useOwlWallet()

    const membershipClaim = normalizeValue(presentation.verifiableCredential)
      .find(credential => credential.type.includes(
        OWLMEANS_CREDENTIAL_TYPE_MEMBERSHIP
      ))

    let group: Credential = normalizeValue(membershipClaim?.evidence).find(
      evidence => (evidence as Credential).type.includes(OWLMEANS_GROUP_CHAINED_TYPE)
    ) as Credential

    if (!group) {
      group = getGroupFromMembershipClaimPresentation(presentation) as Credential
    }

    if (!group && conn) {
      const ownerMembership = handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES)
        .getCredential(conn.sender.id, REGISTRY_SECTION_OWN)
      group = normalizeValue(ownerMembership?.credential.evidence)
        .find(
          evidence => (evidence as Credential).type.includes(OWLMEANS_CREDENTIAL_TYPE_GROUP)
        ) as Credential
    }
    const credential = presentation.verifiableCredential[0]
    const groupSubject = getCompatibleSubject<GroupSubject>(group)
    const subject = getCompatibleSubject<MembershipSubject>(credential)
    const [offer, setOffer] = useState<Presentation | undefined>(undefined)
    const [name, setName] = useState('')

    const methods = useForm<OfferFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        membership: {
          group: groupSubject,
          offer: subject
        }
      }
    })

    const proceed = async (data: OfferFields) => {
      const loader = await navigator?.invokeLoading()
      try {
        if (!handler.wallet) {
          throw ERROR_WIDGET_AUTHENTICATION
        }
        if (!ext) {
          throw ERROR_MEMBERSHIP_READYTO_CLAIM
        }

        const subject = data.membership.offer
        delete (subject as any).alert

        const unsignedMembership = JSON.parse(JSON.stringify(
          getMembershipClaim(presentation)
        )) as Credential<MembershipSubject>
        console.log('loading...')
        if (
          !normalizeValue(unsignedMembership.evidence)
            .find(evidence => (evidence as Credential).type.includes(
              OWLMEANS_CREDENTIAL_TYPE_GROUP
            ))
        ) {
          unsignedMembership.evidence = addToValue(unsignedMembership.evidence, group)
          unsignedMembership.credentialSubject.groupId = group.id
          methods.setValue('membership.offer.groupId', group.id)
        }

        const factory = ext.getFactory(OWLMEANS_CREDENTIAL_TYPE_MEMBERSHIP)
        const offer = await factory.offer(handler.wallet, {
          claim: presentation,
          credential: unsignedMembership,
          holder: getMembershipClaimHolder(presentation),
          cryptoKey: await handler.wallet.keys.getCryptoKey(),
          claimType: OWLMEANS_GROUP_CLAIM_TYPE,
          offerType: OWLMEANS_MEMBERSHIP_OFFER_TYPE,
          subject: {
            ...subject, ...(
              subject.groupId ? { groupId: subject.groupId } : { groupId: group.id }
            )
          },
          id: presentation.id as string,
          challenge: presentation.proof.challenge || '',
          domain: presentation.proof.domain || '',
        })

        setOffer(offer)
      } catch (error) {
        console.error(error)
        loader?.error(error)
        if (error.message) {
          methods.setError('membership.offer.alert', { type: error.message })
          return
        }
      } finally {
        loader?.finish()
      }
    }

    useEffect(() => {
      (async () => {
        if (!handler.wallet || !extensions) {
          return
        }
        const factory = ext.getFactory(OWLMEANS_CREDENTIAL_TYPE_MEMBERSHIP)
        const result = await factory.validate(handler.wallet, {
          presentation, credential, extensions: extensions.registry
        })
        if (!result.valid) {
          const cause = singleValue(result.cause)
          if (!cause) {
            methods.setError('membership.offer.alert', { type: 'unknwonValidationError' })
          } else if (typeof cause === 'string') {
            methods.setError('membership.offer.alert', { type: cause })
          } else {
            methods.setError('membership.offer.alert', {
              type: cause.kind, message: cause.message
            })
          }
          return
        }
      })()
    }, [presentation.id])

    useEffect(() => {
      if (!handler.wallet || !extensions || !offer) {
        return
      }

      const credential = offer.verifiableCredential[0]
      extensions.triggerEvent<RetreiveNameEventParams>(
        handler.wallet, EXTENSION_TRIGGER_RETRIEVE_NAME, {
        credential, setName: (name: string) => { setName(name) }
      })
    }, [offer?.id])

    const _props = {
      i18n, t, rules: {
        "membership.offer.role": generalNameVlidation(),
        "membership.offer.memberCode": generalNameVlidation()
      }
    }

    const send = async () => {
      if (conn && offer && handler.wallet) {
        await getDIDCommUtils(handler.wallet).send(conn, offer)

        handler.wallet.getRegistry(REGISTRY_TYPE_INBOX).removeCredential(presentation, REGISTRY_SECTION_PEER)
        close && close()
      }
    }

    return <Fragment>
      {!offer
        ? <Fragment>
          <DialogContent>
            <WalletFormProvider {...methods}>
              <PrimaryForm {..._props} title="membership.offer.title">
                {groupSubject && <MainTextOutput {..._props} field="membership.group.name" showHint />}
                {subject.groupId && subject.groupId !== ''
                  && <MainTextOutput {..._props} field="membership.offer.groupId" showHint />}
                <MainTextInput {..._props} field="membership.offer.role" />
                <LongTextInput {..._props} field="membership.offer.description" />
                <MainTextInput {..._props} field="membership.offer.memberCode" />
                <MainTextOutput {..._props} field="membership.offer.createdAt" showHint formatter={dateFormatter} />
                <AlertOutput {..._props} field="membership.offer.alert" />
              </PrimaryForm>
            </WalletFormProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={methods.handleSubmit(proceed)}>{`${t('membership.offer.proceed')}`}</Button>
            <Button onClick={close}>{`${t('membership.offer.close')}`}</Button>
          </DialogActions>
        </Fragment>
        : <Fragment>
          <DialogContent>
            <WalletFormProvider {...methods}>
              <PrimaryForm {...props} title="membership.offer.title">
                {groupSubject && <MainTextOutput {...props} field="membership.group.name" showHint />}
                <MainTextOutput {...props} field="membership.offer.groupId" showHint />
                <MainTextOutput {...props} field="membership.offer.role" showHint />
                {subject.description !== ''
                  && <MainTextOutput {...props} field="membership.offer.description" showHint />}
                <MainTextOutput {...props} field="membership.offer.memberCode" showHint />
                <MainTextOutput {...props} field="membership.offer.createdAt" showHint formatter={dateFormatter} />
              </PrimaryForm>
            </WalletFormProvider>
          </DialogContent>
          <DialogActions>
            <CredentialActionGroup prettyOutput content={offer} exportTitle={name} />
            {conn && <Button onClick={send}>{`${t('membership.offer.send')}`}</Button>}
            <Button onClick={close}>{`${t('membership.offer.close')}`}</Button>
          </DialogActions>
        </Fragment>}
    </Fragment>
  })

export type MembershipOfferParams = EmptyProps & {
  ext: OwlMeansGroupExtension
  credential: Presentation
  conn?: DIDCommConnectMeta
  connection?: CommConnectionStatusHandler
  close?: () => void
}

export type MembershipOfferProps = WalletComponentProps<MembershipOfferParams>

export type OfferFields = {
  membership: {
    group: GroupSubject | undefined
    offer: MembershipSubject & { alert: string }
  }
}