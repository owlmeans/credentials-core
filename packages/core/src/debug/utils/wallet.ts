import { nodeCryptoHelper } from "@owlmeans/regov-ssi-common"
import { CredentialSubject, MaybeArray, UnsignedCredential } from "../../credential"
import { ClaimBundle, ClaimCredential, ClaimSubject, holderCredentialHelper } from "../../holder"
import {
  buildWalletWrapper,
  WalletWrapper,
  identityHelper,
  WrappedDocument,
  Presentation,
  Credential
} from "../../index"
import { issuerCredentialHelper, OfferBundle, OfferCredential, OfferSubject } from "../../issuer"
import { RequestBundle, verifierCredentialHelper } from "../../verifier"
import { EntityIdentity, identityBundler } from "../../wallet"


export namespace TestUtil {
  export type IdentityFields = {
    firstname: string
    lastname: string
  }

  export type TestDocumentData1 = {
    key: string
    comment: string
  }

  export type TestDocumentData2 = {
    id: string
    description: string
  }

  export type TestCredential = Credential<CredentialSubject<
    WrappedDocument<TestDocumentData2 | TestDocumentData1>, {}
  >>

  export type TestClaim = ClaimCredential<ClaimSubject<
    UnsignedCredential<CredentialSubject<
      WrappedDocument<TestDocumentData2 | TestDocumentData1>, {}
    >>
  >>

  export type TestOffer = OfferCredential<OfferSubject<TestCredential>>

  export const IDENTITY_TYPE = 'TestUtilIdentity'

  export class Wallet {

    constructor(public wallet: WalletWrapper, public name: string) {
    }

    static async setup(name: string) {
      const walletUtil = new Wallet(await buildWalletWrapper(nodeCryptoHelper, '11111111',
        { name, alias: name },
        {
          prefix: process.env.DID_PREFIX,
          defaultSchema: 'https://owlmeans.com'
        }
      ), name)

      return walletUtil
    }

    async produceIdentity() {
      return await identityHelper<IdentityFields>(
        this.wallet,
        this.wallet.ctx.buildLDContext('identity', {
          xsd: 'http://www.w3.org/2001/XMLSchema#',
          firstname: { '@id': 'scm:firstname', '@type': 'xsd:string' },
          lastname: { '@id': 'scm:lastname', '@type': 'xsd:string' }
        })
      ).createIdentity(
        IDENTITY_TYPE,
        {
          firstname: this.name,
          lastname: 'Lastname'
        },
      )
    }

    async requestIdentity() {
      return await identityBundler(this.wallet).request()
    }

    async validateRequest(request: RequestBundle) {
      const [result, info] = await holderCredentialHelper(this.wallet)
        .request().verify(request)
      if (!result) {
        console.log(request, info)
      }

      return result
    }

    async validateIdentityResponse(response: Presentation<EntityIdentity>) {
      const { result, entity } = await verifierCredentialHelper(this.wallet)
        .response().verify(response)

      return [result, entity]
    }

    async provideIdentity(request?: RequestBundle) {
      return await identityBundler(this.wallet).response(request)
    }

    async trustIdentity(response: Presentation<EntityIdentity>) {
      await identityBundler(this.wallet).trust(response)
    }

    async claimTestDoc(data: (TestDocumentData1 | TestDocumentData2)[]) {
      const claims = await Promise.all(data.map(
        async data => await holderCredentialHelper(this.wallet).claim<
          TestDocumentData1 | TestDocumentData2
        >({ type: 'TestDocument' }).build(data)
      ))

      const requestClaim = await holderCredentialHelper(this.wallet).bundle<
        TestClaim
      >().build(claims)

      await holderCredentialHelper(this.wallet).claim<
        TestDocumentData1 | TestDocumentData2
      >({ type: 'TestDocument' }).register(requestClaim)

      return requestClaim
    }

    async unbundleClaim(claimRequest: ClaimBundle<TestClaim>) {
      return await issuerCredentialHelper(this.wallet)
        .bundle<TestClaim, TestOffer>().unbudle(claimRequest)
    }

    async signClaims(claims: TestClaim[]) {
      const offers = await issuerCredentialHelper(this.wallet).claim<
        TestDocumentData1 | TestDocumentData2, {},
        TestCredential
      >().signClaims(claims)

      return await issuerCredentialHelper(this.wallet)
        .bundle<TestClaim, TestOffer>().build(offers)
    }

    async unbundleOffer(offer: OfferBundle<TestOffer>) {
      return await holderCredentialHelper(this.wallet)
        .bundle<TestClaim, TestOffer>().unbudle(offer)
    }

    async storeOffer(offer: OfferBundle<TestOffer>) {
      await holderCredentialHelper(this.wallet)
        .bundle<TestClaim, TestOffer>().store(offer)
    }

    async requestCreds() {
      const req = await verifierCredentialHelper(this.wallet)
        .request().build({ '@type': 'TestDocument' })

      return await verifierCredentialHelper(this.wallet)
        .request().bundle([req])
    }

    async provideCreds(request: RequestBundle) {
      const { requests } = await holderCredentialHelper(this.wallet)
        .request().unbundle(request)

      return await holderCredentialHelper(this.wallet)
        .response().build<TestCredential>(requests, request)
    }

    async validateResponse(response: Presentation<EntityIdentity | TestCredential>) {
      const { result } = await verifierCredentialHelper(this.wallet)
        .response().verify<EntityIdentity | TestCredential>(response)

      if (!result) {
        return false
      }

      return true
    }
  }
}