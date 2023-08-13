import { CredentialListInputDetailsProps } from "@owlmeans/vc-lib-react"
import { PersonalIdSubject, OwlMeansStdPersonalIdClaim } from "../../../../types"


export type PersonalIdClaimProps = CredentialListInputDetailsProps<OwlMeansStdPersonalIdClaim>

export type PresonalIdClaimFields = {
  std: {
    personalId: PersonalIdSubject
    presonalIdAux: {
      alert: string
    }
  }
}