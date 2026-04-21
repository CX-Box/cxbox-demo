import { CertificateData } from '@interfaces/sign'
import { getCadesPlugin } from '@utils/cadesPlugin/getCadesPlugin'

export default async function getCertificates(): Promise<CertificateData[]> {
    const cadesplugin = getCadesPlugin()

    const oStore = await cadesplugin.CreateObjectAsync('CAdESCOM.Store')
    await oStore.Open(cadesplugin.CADESCOM_CONTAINER_STORE, cadesplugin.CAPICOM_MY_STORE, cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED)

    const oStoreCerts = await oStore.Certificates
    const oStoreCertsCount = await oStoreCerts.Count

    const certs: CertificateData[] = []

    for (let i = 1; i <= oStoreCertsCount; i++) {
        const cert = await oStoreCerts.Item(i)
        const to = (await cert.ValidToDate) as Date
        const from = (await cert.ValidFromDate) as Date
        const name = await cert.GetInfo(0)
        const validator = await cert.IsValid()
        const isValid = await validator.Result
        const hasPrivateKey = await cert.HasPrivateKey()

        let privateKey = null
        let cryptoProvider = undefined
        let privateKeyLink = undefined

        if (hasPrivateKey) {
            privateKey = await cert.PrivateKey
            cryptoProvider = await privateKey.ProviderName
            privateKeyLink = await privateKey.UniqueContainerName
        }

        const provider = await cert.GetInfo(1)
        const email = await cert.GetInfo(2)
        const providerEmail = await cert.GetInfo(3)

        const publicKey = await cert.PublicKey()
        const encodedKey = await publicKey.EncodedKey
        const encodedKeyValue = await encodedKey.Value
        const publicKeyValue = await encodedKeyValue()

        const algorithm = await publicKey.Algorithm
        const algorithmFriendlyName = await algorithm.FriendlyName

        certs.push({
            to,
            from,
            name,
            provider,
            email,
            providerEmail,
            itself: cert,
            isValid,
            hasPrivateKey,
            cryptoProvider,
            privateKeyLink,
            algorithmFriendlyName,
            publicKeyValue
        })
    }

    await oStore.Close()
    return certs
}
