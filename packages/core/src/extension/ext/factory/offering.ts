/**
 *  Copyright 2023 OwlMeans
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

import { DIDDocument, DIDDocumentUnsinged, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, VERIFICATION_KEY_CONTROLLER } from "../../../did"
import { Credential } from '../../../vc'
import { buildWalletLoader } from '../../../wallet/loader'
import { updateDidIdWithKey, validateVerifiableId } from "../../schema"
import { OfferMethodBuilder, TYPE_OWLMEANS_OFFER } from "../types"


export const defaultOfferMethod: OfferMethodBuilder = schema => async (wallet, params) => {
  const {
    claim, credential, holder, subject, cryptoKey, claimType, offerType, id, challenge, domain
  }: typeof params = {
    ...params, ...(!params.claimType && schema.claimType ? { claimType: schema.claimType } : {}),
    ...(!params.offerType && schema.offerType ? { offerType: schema.offerType } : {})
  }

  const [isValid, result] = await wallet.ssi.verifyPresentation(claim, undefined, {
    testEvidence: true, nonStrictEvidence: true, localLoader: buildWalletLoader(wallet)
  })

  if (!isValid) {
    console.error(result)
    throw 'claim.invalid'
  }

  const offeredCredential = JSON.parse(JSON.stringify(credential)) as Credential
  offeredCredential.credentialSubject = subject as any
  let issuerDid: DIDDocument | DIDDocumentUnsinged = JSON.parse(JSON.stringify(holder))
  delete (issuerDid as any).proof
  updateDidIdWithKey(wallet.did.helper(), schema, cryptoKey, issuerDid, offeredCredential)
  issuerDid = await wallet.did.helper().signDID(
    cryptoKey, issuerDid, VERIFICATION_KEY_CONTROLLER,
    [DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
  )
  delete (offeredCredential as any).proof
  if (claimType) {
    const idx = offeredCredential.type.findIndex(type => type === claimType)
    offeredCredential.type.splice(idx, 1)
  }

  if (!validateVerifiableId(wallet.did.helper(), schema, offeredCredential)) {
    offeredCredential.id = issuerDid.id
    offeredCredential.holder = { id: issuerDid.id }
  } else {
    offeredCredential.holder = holder
  }

  const signed = await wallet.ssi.signCredential(offeredCredential, issuerDid as DIDDocument)
  const offer = await wallet.ssi.buildPresentation([signed], {
    holder: issuerDid, type: [...(offerType != null ? [offerType] : []), TYPE_OWLMEANS_OFFER], id
  })

  return wallet.ssi.signPresentation(offer, issuerDid as DIDDocument, { challenge, domain })
}
