import { addToValue, MaybeArray, normalizeValue } from "@owlmeans/regov-ssi-common";
import { CredentialDescription, ExtensionDetails, ExtensionEvent, ExtensionSchema } from "./types";

export const buildExtensionSchema = <CredType extends string>(
  details: ExtensionDetails,
  credentials: { [key: string]: CredentialDescription },
): ExtensionSchema => {
  const _schema = {
    details,
    credentials: Object.entries<CredentialDescription>(credentials).reduce((creds, [key, cred]) => {
      return {
        ...creds,
        [key]: {
          ...cred,
          ...(cred.claimType ? { claimType: cred.claimType } : { claimType: details.types?.claim })
        }
      }
    }, {} as { [key in CredType]: CredentialDescription }),
  }

  return _schema
}

export const addObserverToSchema = (
  schema: ExtensionSchema,
  event: MaybeArray<ExtensionEvent>
): ExtensionSchema => ({
  ...schema, events: normalizeValue(addToValue(schema.events, event))
})