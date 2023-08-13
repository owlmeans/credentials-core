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

import { EVENT_INIT_CONNECTION, IncommigDocumentWithConn, InitCommEventParams } from "@owlmeans/vc-comm"
import {
  buildUIExtension, castMainModalHandler, EXRENSION_ITEM_PURPOSE_INPUT_DETAILS, EXTENSION_ITEM_PURPOSE_CLAIM,
  EXTENSION_ITEM_PURPOSE_CREATION, EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET,
  EXTENSION_ITEM_PURPOSE_ITEM, EXTENSION_ITEM_PURPOSE_REQUEST, EXTENSION_ITEM_PURPOSE_VALIDATION,
  MainModalAuthenticatedEventParams, PurposeListItemParams, UIExtensionFactoryProduct
} from "@owlmeans/vc-lib-react"
import { MENU_TAG_CRED_NEW, MENU_TAG_REQUEST_NEW, MENU_TAG_CLAIM_NEW } from "@owlmeans/vc-lib-react"
import { EXTENSION_TRIGGER_AUTHENTICATED, normalizeValue } from "@owlmeans/vc-core"
import {
  WalletWrapper, Credential, isCredential, isPresentation, Presentation, REGISTRY_TYPE_IDENTITIES
} from "@owlmeans/vc-core"
import {
  addObserverToSchema, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED
} from "@owlmeans/vc-core"
import React from "react"
import {
  SignatureCreationWeb, SignatureItemWeb, SignatureView, SignatureRequestWeb, DashboardWidgetWeb,
  SignatureRequestItemWeb, SignatureRequestViewWeb, SignatureResponseWeb, SignatureRequestResponseWeb,
  ValidationWidget, PersonalIdClaim, SignatureClaimWeb, SignatureOfferWeb, SignatureOfferReviewWeb
} from "./component"
import { ClaimSignatureItemParams, SignatureClaimItem } from "./component/web/claim-item"
import { OfferSignatureItemParams, SignatureOfferItem } from "./component/web/offer-item"
import { signatureExtension } from "./ext"
import {
  OWLMEANS_CREDENTIAL_TYPE_SIGNATURE, OWLMEANS_CRED_PERSONALID, OWLMEANS_SIGNATURE_CLAIM_TYPE,
  OWLMEANS_SIGNATURE_OFFER_TYPE, OWLMEANS_SIGNATURE_REQUEST_TYPE, OWLMEANS_SIGNATURE_RESPONSE_TYPE,
  SignaturePresentation
} from "./types"
import { getSignatureRequestFromPresentation, getSignatureRequestOwner } from "./util"


if (signatureExtension.schema.events) {
  const modalHandler = castMainModalHandler(signatureExtension)

  signatureExtension.modifyEvent(EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, 'method', async (
    wallet: WalletWrapper, params: IncommigDocumentWithConn
  ) => {
    params.statusHandler.successful = false
    if (!modalHandler.handle) {
      return false
    }

    const modalHandle = modalHandler.handle.upgrade(params)

    if (modalHandle.open) {
      if (isCredential(params.credential)) {
        params.statusHandler.successful = modalHandle.open(
          () => <SignatureView ext={signatureExtension} close={modalHandle.close}
            credential={params.credential as Credential} />
        )
      } else if (isPresentation(params.credential)) {
        if (normalizeValue(params.credential.type).includes(OWLMEANS_SIGNATURE_REQUEST_TYPE)) {
          let isOwner = false
          const request = getSignatureRequestFromPresentation(params.credential)
          if (request) {
            const owner = getSignatureRequestOwner(request)
            const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
            isOwner = !!registry.getCredential(owner?.id)
          }
          if (isOwner) {
            params.statusHandler.successful = modalHandle.open(
              () => <SignatureRequestViewWeb ext={signatureExtension} close={modalHandle.close}
                credential={params.credential as Presentation} />
            )
          } else {
            params.statusHandler.successful = modalHandle.open(
              () => <SignatureResponseWeb ext={signatureExtension} close={modalHandle.close}
                credential={params.credential as Presentation} />
            )
          }
        } else if (normalizeValue(params.credential.type).includes(OWLMEANS_SIGNATURE_RESPONSE_TYPE)) {
          params.statusHandler.successful = modalHandle.open(
            () => <SignatureRequestResponseWeb ext={signatureExtension} close={modalHandle.close}
              credential={params.credential as Presentation} />
          )
        } else if (normalizeValue(params.credential.type).includes(OWLMEANS_SIGNATURE_CLAIM_TYPE)) {
          if (params.conn) {
            params.statusHandler.successful = modalHandle.open(
              () => params.conn && <SignatureOfferWeb close={modalHandle.close} conn={params.conn}
                ext={signatureExtension} claim={params.credential as SignaturePresentation} />
            )
          }
        } else if (normalizeValue(params.credential.type).includes(OWLMEANS_SIGNATURE_OFFER_TYPE)) {
          params.statusHandler.successful = modalHandle.open(
            () => params.conn && <SignatureOfferReviewWeb offer={params.credential as SignaturePresentation}
              close={modalHandle.close} ext={signatureExtension} />
          )
        }
      }

      if (params.statusHandler.successful) {
        return true
      }
    }

    return false
  })
}

signatureExtension.schema = addObserverToSchema(signatureExtension.schema, {
  trigger: EXTENSION_TRIGGER_AUTHENTICATED,
  method: async (wallet, params: MainModalAuthenticatedEventParams) => {
    const statusHandle = { established: false }
    params.extensions.triggerEvent<InitCommEventParams>(wallet, EVENT_INIT_CONNECTION, {
      statusHandle,
      trigger: async (conn, doc) => {
        if (isPresentation(doc)) {
          params.extensions.triggerEvent<IncommigDocumentWithConn>(
            wallet, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, {
            conn, credential: doc, statusHandler: { successful: false },
            cleanUp: () => { }
          })
        }
      }
    })
  }
})

export const signatureWebExtension = buildUIExtension(signatureExtension, (purpose, type?) => {
  switch (purpose) {
    case EXTENSION_ITEM_PURPOSE_CREATION:
      switch (type) {
        case OWLMEANS_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureCreationWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureCreation`,
            params: {},
            order: 0
          }]
      }
    case EXTENSION_ITEM_PURPOSE_REQUEST:
      switch (type) {
        case OWLMEANS_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureRequestWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureRequest`,
            params: {},
            order: 0
          }]
      }
    case EXTENSION_ITEM_PURPOSE_CLAIM:
      switch (type) {
        case OWLMEANS_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureClaimWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureClaim`,
            params: {},
            order: 0
          }]
      }
    case EXTENSION_ITEM_PURPOSE_ITEM:
      switch (type) {
        case OWLMEANS_SIGNATURE_CLAIM_TYPE:
          return [{
            com: SignatureClaimItem(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureClaimItem`,
            params: {},
            order: 0
          }] as UIExtensionFactoryProduct<ClaimSignatureItemParams>[]
        case OWLMEANS_SIGNATURE_OFFER_TYPE:
          return [{
            com: SignatureOfferItem(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureOfferItem`,
            params: {},
            order: 0,
          }] as UIExtensionFactoryProduct<OfferSignatureItemParams>[]
        case OWLMEANS_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: SignatureItemWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureItem`,
            params: {},
            order: 0
          }] as UIExtensionFactoryProduct<PurposeListItemParams>[]
        case OWLMEANS_SIGNATURE_REQUEST_TYPE:
          return [{
            com: SignatureRequestItemWeb(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}SignatureRequestItem`,
            params: {},
            order: 0
          }]
      }
    case EXTENSION_ITEM_PURPOSE_DASHBOARD_WIDGET:
      return [{
        com: DashboardWidgetWeb(signatureExtension),
        extensionCode: `${signatureExtension.schema.details.code}DashboardWidget`,
        params: {},
        order: 0
      }]
    case EXTENSION_ITEM_PURPOSE_VALIDATION:
      switch (type) {
        case OWLMEANS_CREDENTIAL_TYPE_SIGNATURE:
          return [{
            com: ValidationWidget(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}ValidationWidget`,
            params: {},
            order: 0
          }]
      }
    case EXRENSION_ITEM_PURPOSE_INPUT_DETAILS:
      switch (type) {
        case OWLMEANS_CRED_PERSONALID:
          return [{
            com: PersonalIdClaim(signatureExtension),
            extensionCode: `${signatureExtension.schema.details.code}PersonalIdClaim`,
            params: {},
            order: 0
          }]
      }
  }

  return [] as UIExtensionFactoryProduct<{}>[]
})

signatureWebExtension.menuItems = [
  {
    title: 'menu.new.signature',
    menuTag: MENU_TAG_CRED_NEW,
    ns: signatureExtension.localization?.ns,
    action: {
      path: '',
      params: {
        ext: signatureExtension.schema.details.code,
        type: OWLMEANS_CREDENTIAL_TYPE_SIGNATURE
      }
    }
  },
  {
    title: 'menu.request.signature',
    menuTag: MENU_TAG_REQUEST_NEW,
    ns: signatureExtension.localization?.ns,
    action: {
      path: '',
      params: {
        ext: signatureExtension.schema.details.code,
        type: OWLMEANS_CREDENTIAL_TYPE_SIGNATURE
      }
    }
  },
  {
    title: 'menu.claim.signature',
    menuTag: MENU_TAG_CLAIM_NEW,
    ns: signatureExtension.localization?.ns,
    action: {
      path: '',
      params: {
        ext: signatureExtension.schema.details.code,
        type: OWLMEANS_CREDENTIAL_TYPE_SIGNATURE
      }
    }
  }
]