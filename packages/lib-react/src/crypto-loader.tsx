/**
 *  Copyright 2024 OwlMeans
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

import { FC, useEffect } from 'react'
import { encodeBase58, decodeBase58, toBeArray, getBytes, sha256, randomBytes, HDNodeWallet } from 'ethers'
import { getCryptoAdapter } from '@owlmeans/vc-core'
import { secp256k1 } from '@noble/curves/secp256k1'
import type { CryptoLoaderProps } from './shared'

const aes = require('browserify-aes/browser')

const CryptoLoader: FC<CryptoLoaderProps> = ({ onFinish, deps }) => {
  useEffect(() => {
    const adapter = getCryptoAdapter()
    adapter.setBase58Impl(encodeBase58, decodeBase58, toBeArray)
    adapter.setSha256Impl(sha256, getBytes)
    adapter.setAesImpl(aes)
    adapter.setRandomImpl(randomBytes)
    adapter.setSecpImpl(secp256k1.sign, secp256k1.verify)
    adapter.WalletClass = HDNodeWallet as any
    return onFinish()
  }, deps ?? [])

  return <></>
}

export default CryptoLoader
