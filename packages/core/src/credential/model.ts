
import { _keysHelper } from "keys/helper";
import { CommonContext } from "common/types";
import { CreateCredentialMethod, ERROR_NO_DEFINITION, ERROR_NO_HOLDER, ERROR_NO_ISSUER, SignCredentialMethod, VerifyCredentialMethod } from "./types";


export const buildCreateCrednetialMethod =
  (context: CommonContext): CreateCredentialMethod =>
    async (type, subject, holder = undefined, credContext = undefined) => {
      if (holder === undefined) {
        throw new Error(ERROR_NO_HOLDER)
      }
      if (credContext === undefined) {
        throw new Error(ERROR_NO_DEFINITION)
      }

      return context.buildCredential({
        id: 'did:peer:xxxxx', // @TODO generate ID from context
        type,
        subject,
        holder,
        context: credContext
      })
    }

export const buildSignCredentialMethod =
  (context: CommonContext): SignCredentialMethod =>
    async (credential, issuer?, options = {}) => {
      if (!issuer) {
        throw new Error(ERROR_NO_ISSUER)
      }

      const key = _keysHelper.parseSigningKeyOptions(context.keys, options)
      return context.signCredential(
        credential,
        issuer,
        await _keysHelper.keyToCryptoKey(
          context.keys, key,
          options.password,
          { rotation: options.rotation }
        ),
        { controllerRole: options.controllerRole }
      )
    }

export const buildVerifyCredentialMethod = (context: CommonContext): VerifyCredentialMethod =>
  async (credential, options = {}) => {

    return true
  }