
let _password: string | undefined = undefined

export const isOwlWalletPasswordSet = () => _password !== undefined

export const setOwlWalletPassword = (password: string) => (_password = password)

export const getOwlWalletPassword = () => _password
