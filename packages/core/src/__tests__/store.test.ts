import { nodeCryptoHelper } from "@owlmeans/regov-ssi-common"
import { EncryptedStore } from "../store"
import { WalletWrapper } from "../wallet/types"
import { buildWalletWrapper } from "../wallet/wallet"

import util from 'util'
import { KEYCHAIN_DEFAULT_KEY } from "../keys/types"
util.inspect.defaultOptions.depth = 6


describe('Wallet', () => {

  const _ctx: {
    seed: string
    wallet?: WalletWrapper
    store?: EncryptedStore
  } = {
    seed: 'CGETek79CLUkP9vB48Tnj7VEqiWTmD46RScExYGieiE2'
  }

  it('creates store', async () => {
    const wallet = _ctx.wallet = await buildWalletWrapper(nodeCryptoHelper, '11111111', {
      alias: 'current',
      name: 'Some name'
    }, { key: { seed: _ctx.seed } })

    expect(wallet.store.alias).toBe('current')
  })

  it('exports store', async () => {
    if (!_ctx.wallet) {
      throw new Error('No wallet from pervious test')
    }

    const store = _ctx.store = await _ctx.wallet.export('11111111')

    expect(store.alias).toBe('current')
  })

  it('imports store back', async () => {
    if (!_ctx.store) {
      throw new Error('No store from pervious test')
    }

    const newWallet = await buildWalletWrapper(nodeCryptoHelper, '11111111', _ctx.store)

    expect(newWallet.wallet).toMatchSnapshot({
      keyChain: {
        keys: {
          [KEYCHAIN_DEFAULT_KEY]: {
            seed: expect.any(String),
            rotations: [
              { private: expect.any(String) },
              {
                private: expect.any(String),
                public: expect.any(String)
              },
            ]
          }
        }
      }
    })
  })
})