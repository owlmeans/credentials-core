
import { EncryptedStore, WalletHandler } from '@owlmeans/vc-core'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const buildStorageHelper = (
  handler: WalletHandler
) => {
  const _commited: string[] = []

  let _obvserIdx = -1

  const _helper = {
    loaded: false,

    init: async () => {
      if (_obvserIdx > -1) {
        return
      }
      const storeList = await AsyncStorage.getAllKeys()
      handler.stores = (await Promise.all(storeList.map(
        key => AsyncStorage.getItem(key)
      ))).map(
        store => store && JSON.parse(store) as EncryptedStore
      ).reduce(
        (stores, store) => {
          return store && store.hasOwnProperty('alias') && !store.toRemove
            ? { ...stores, [store.alias]: store } : stores
        }, {}
      )

      handler.observers.push(() => {
        _helper.commitAsync()
      })
      _obvserIdx = handler.observers.length - 1

      _helper.loaded = true
    },

    touch: (alias: string) => {
      const idx = _commited.findIndex(_alias => _alias === alias)
      if (idx > -1) {
        _commited.splice(idx, 1)
      }
    },

    detach: () => {
      delete handler.observers[_obvserIdx]
    },

    commit: async () => {
      console.info('STORE COMMITS')

      let promises: Promise<void | null | null[]>[] = []

      Object.entries(handler.stores).map(
        ([alias, store]) => {
          if (store.toRemove) {
            console.info(`::: remove ${alias}`)
            promises.push(AsyncStorage.removeItem(alias).then(_ => null))
            delete handler.stores[alias]
            _helper.touch(alias)
          }
        }
      )

      promises = [...promises, ...Object.entries(handler.stores).map(
        async ([alias, store]) => {
          if (handler.wallet && handler.wallet.store.alias === alias) {
            return null
          }
          if (_commited.includes(alias)) {
            return null
          }

          console.info(`::: commit ${alias}`)

          store.toRemove = false

          _commited.push(alias)
          return AsyncStorage.setItem(alias, JSON.stringify(store))
        }
      )]

      if (handler.wallet) {
        _commited.push(handler.wallet.store.alias)
        promises.push(handler.wallet.export().then(
          value => {
            console.info(`::: wallet commit ${value.alias}`)
            handler.stores[value.alias] = value
            value.toRemove = false
            return AsyncStorage.setItem(
              value.alias, JSON.stringify(value)
            )
          }
        ))
      }

      promises.push(AsyncStorage.getAllKeys().then(
        keys => Promise.all(keys.map(
          async alias => {
            if (!handler.stores[alias]) {
              console.info(`::: cleanup ${alias}`)
              await AsyncStorage.removeItem(alias)
              _helper.touch(alias)
            }
            return null
          }
        ))
      ))

      return Promise.all(promises)
    },

    commitAsync: () => {
      _helper.commit().catch(e => console.error(e))
    }
  }

  return _helper
}
