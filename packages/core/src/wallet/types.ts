import { DIDRegistryBundle, DIDRegistryWrapper } from "@owlmeans/regov-ssi-did"
import { CryptoHelper } from "@owlmeans/regov-ssi-common"
import { SSICore , Credential } from "../vc"
import { CreateKeyOptions, KeyChain, KeyChainWrapper } from "../keys/types"
import { BasicStore, EncryptedStore, SecureStore } from "../store/types"
import { CredentialsRegistry, CredentialsRegistryWrapper, RegistryType } from './registry/types'


export type Wallet = {
  intialized?: boolean

  keyChain?: KeyChain

  registry?: DIDRegistryBundle

  identities?: CredentialsRegistry

  credentials?: CredentialsRegistry
}

export type WalletWrapperMethodBuilder<Method extends Function> = (wallet: Wallet, context: SSICore) => Method

export type WalletWrapperBuilder = <Store extends BasicStore = BasicStore>(
  crypto: CryptoHelper,
  password: string,
  store?: Store | string,
  options?: WalletOptions
) => Promise<WalletWrapper>

export type WalletOptions = {
  prefix?: string
  defaultSchema?: string,
  key?: CreateKeyOptions
}

export type WalletWrapper = {
  store: SecureStore

  wallet: Wallet

  did: DIDRegistryWrapper

  keys: KeyChainWrapper

  ssi: SSICore

  hasIdentity: () => boolean

  getIdentity: <Identity extends Credential = Credential>() => Identity | undefined

  getRegistry: GetRegistryMethod

  export: (_password?: string) => Promise<EncryptedStore>

  getConfig: () => WalletOptions
}

export type GetRegistryMethod = (type?: RegistryType) => CredentialsRegistryWrapper

export const DEFAULT_WALLET_ALIAS = 'citizen'

