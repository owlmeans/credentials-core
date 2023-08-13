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

import { BuildMethodParams, Extension } from "@owlmeans/vc-core"

export type OwlMeansGroupCredential = typeof OWLMEANS_CREDENTIAL_TYPE_GROUP
export type OwlMeansGroupMembershipCredential = typeof OWLMEANS_CREDENTIAL_TYPE_MEMBERSHIP
export type OwlMeansGroupClaim = typeof OWLMEANS_MEMBERSHIP_CLAIM_TYPE
export type OwlMeansGroupCredentialClaim = typeof OWLMEANS_GROUP_CLAIM_TYPE

export type OwlMeansGroupExtensionTypes = OwlMeansGroupCredential | OwlMeansGroupMembershipCredential 
  | OwlMeansGroupClaim | OwlMeansGroupCredentialClaim

export type GroupSubject = {
  uuid: string
  name: string
  description: string
  createdAt: string
  depth?: number
}

export type OwlMeansGroupExtension = Extension

export type MembershipSubject = {
  groupId: string
  role: string
  memberCode: string
  description: string
  createdAt: string
}

export type ChainedType = typeof OWLMEANS_GROUP_CHAINED_TYPE 
 | typeof OWLMEANS_GROUP_LIMITED_TYPE
 | typeof OWLMEANS_GROUP_ROOT_TYPE

export type GroupBuildMethodParams = BuildMethodParams & {
  chainedType?: ChainedType
  depth?: number
}

export const OWLMEANS_CREDENTIAL_TYPE_GROUP = 'OwlMeans:Credentials:Group'

export const OWLMEANS_CREDENTIAL_TYPE_MEMBERSHIP = 'OwlMeans:Credentials:Group:Membership'

export const OWLMEANS_GROUP_CLAIM_TYPE = 'OwlMeans:Credentials:Group:Entity:Claim'

export const OWLMEANS_GROUP_OFFER_TYPE = 'OwlMeans:Credentials:Group:Entity:Offer'

export const OWLMEANS_GROUP_CHAINED_TYPE = 'OwlMeans:Credentials:Group:Chained'

export const OWLMEANS_GROUP_LIMITED_TYPE = 'OwlMeans:Credentials:Group:Limited'

export const OWLMEANS_GROUP_ROOT_TYPE = 'OwlMeans:Credentials:Group:Root'

export const OWLMEANS_MEMBERSHIP_CLAIM_TYPE = 'OwlMeans:Credentials:Group:Claim'

export const OWLMEANS_MEMBERSHIP_OFFER_TYPE = 'OwlMeans:Credentials:Group:Offer'

export const BASIC_IDENTITY_TYPE = 'Identity'

export const OWLMEANS_EXT_GROUP_NAMESPACE = 'owlmeans-vc-ext-groups'

export const SERVER_IS_GROUP_OWNER = '/groups/membership/isOwner'