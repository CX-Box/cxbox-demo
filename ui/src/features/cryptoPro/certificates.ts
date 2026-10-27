import { CertificateProblem, wrapPluginError, CERTIFICATE_PROBLEMS } from './errors'
import { canSignWithKey } from './hashAlgorithm'
import { getCadesPlugin } from './plugin'
import { CertificateData, CertificatePurpose } from './types'

/** The end date is inclusive (RFC 5280): the certificate is still valid at `to` */
const isExpired = (to: Date, now: Date) => now > to

/** The plugin returns a date as an ISO string (typed `VarDate`); `new Date` also accepts a `Date` */
const readDate = async (date: Promise<CADES_Common.VarDate>) => new Date((await date) as unknown as string | Date)

/** Options of {@link getCertificates} */
export interface GetCertificatesOptions {
    /** Include expired certificates. @defaultValue `false` — an expired certificate is skipped after reading its end date */
    expired?: boolean
}

/**
 * Certificates with their properties from the container store of the current user; not expired by default.
 *
 * @remarks
 * A certificate that cannot be read is skipped with a console warning, so one broken certificate does not hide the others.
 *
 * @example
 * ```ts
 * const certificates = await getCertificates()
 * const withExpired = await getCertificates({ expired: true })
 * ```
 *
 * @throws {@link CadesPluginError} if the store cannot be read
 */
export async function getCertificates({ expired = false }: GetCertificatesOptions = {}): Promise<CertificateData[]> {
    const { cadesplugin } = await getCadesPlugin()
    try {
        const store = await cadesplugin.CreateObjectAsync('CAdESCOM.Store')
        await store.Open(cadesplugin.CADESCOM_CONTAINER_STORE, cadesplugin.CAPICOM_MY_STORE, cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED)
        try {
            const certificates = await store.Certificates
            const count = await certificates.Count
            const result: CertificateData[] = []
            const now = new Date()
            for (let i = 1; i <= count; i++) {
                try {
                    const cert = await certificates.Item(i)
                    const to = await readDate(cert.ValidToDate)
                    if (expired || !isExpired(to, now)) {
                        result.push(await readCertificate(cert, to, now))
                    }
                } catch (error) {
                    console.warn(`Certificate ${i} of the store is skipped: ${wrapPluginError(error).message}`)
                }
            }
            return result
        } finally {
            await store.Close()
        }
    } catch (error) {
        throw wrapPluginError(error)
    }
}

/** Reads the chain check result; a failed check counts as an untrusted chain */
async function readIsValid(cert: CAPICOM.CertificateAsync): Promise<boolean> {
    try {
        return await (
            await cert.IsValid()
        ).Result
    } catch (error) {
        console.warn(`Certificate chain check failed: ${wrapPluginError(error).message}`)
        return false
    }
}

/** Provider and container of the private key; a key link that cannot be read counts as no private key */
async function readPrivateKey(
    cert: CAPICOM.CertificateAsync
): Promise<Pick<CertificateData, 'hasPrivateKey' | 'cryptoProvider' | 'privateKeyLink'>> {
    if (!(await cert.HasPrivateKey())) {
        return { hasPrivateKey: false }
    }
    try {
        const privateKey = await cert.PrivateKey
        return { hasPrivateKey: true, cryptoProvider: await privateKey.ProviderName, privateKeyLink: await privateKey.UniqueContainerName }
    } catch (error) {
        console.warn(`Private key of the certificate cannot be read: ${wrapPluginError(error).message}`)
        return { hasPrivateKey: false }
    }
}

/** `CAPICOM_CERT_INFO_TYPE` for `Certificate.GetInfo`: `cadesplugin_api.js` defines only the first two */
const CERT_INFO = {
    SUBJECT_SIMPLE_NAME: 0,
    ISSUER_SIMPLE_NAME: 1,
    SUBJECT_EMAIL_NAME: 2,
    ISSUER_EMAIL_NAME: 3
} as const

async function readCertificate(cert: CAPICOM.CertificateAsync, to: Date, now: Date): Promise<CertificateData> {
    const from = await readDate(cert.ValidFromDate)
    // IsValid() checks the chain and can take seconds; an expired certificate is not valid anyway
    const isValid = isExpired(to, now) ? false : await readIsValid(cert)

    const publicKey = await cert.PublicKey()
    const algorithm = await publicKey.Algorithm
    const keyAlgorithmOid = await algorithm.Value

    return {
        to,
        from,
        name: await cert.GetInfo(CERT_INFO.SUBJECT_SIMPLE_NAME),
        provider: await cert.GetInfo(CERT_INFO.ISSUER_SIMPLE_NAME),
        email: await cert.GetInfo(CERT_INFO.SUBJECT_EMAIL_NAME),
        providerEmail: await cert.GetInfo(CERT_INFO.ISSUER_EMAIL_NAME),
        itself: cert,
        isValid,
        ...(await readPrivateKey(cert)),
        algorithmFriendlyName: await algorithm.FriendlyName,
        publicKeyValue: await (await publicKey.EncodedKey).Value(),
        thumbprint: await cert.Thumbprint,
        keyAlgorithmOid,
        canSign: canSignWithKey(keyAlgorithmOid)
    }
}

/**
 * Why the certificate is likely unusable for the purpose — to mark it in the UI; nothing is blocked by it.
 *
 * @remarks
 * The plugin decides at the operation, as before: it rejects an expired certificate, a missing private key or an untrusted
 * chain with its own error. The only check before the plugin is the signer's key algorithm ({@link resolveHashAlgorithm}):
 * signing by hash is impossible without it.
 * `sign` needs the private key and a key algorithm with a known hash; `encrypt` (the recipient) needs only the public key.
 *
 * @param purpose - `sign` by default
 * @returns `undefined` if the certificate can be used
 */
export function getCertificateProblem(
    cert: Pick<CertificateData, 'from' | 'to' | 'hasPrivateKey' | 'isValid' | 'canSign'>,
    { purpose = 'sign', now = new Date() }: { purpose?: CertificatePurpose; now?: Date } = {}
): CertificateProblem | undefined {
    if (now < cert.from) {
        return CERTIFICATE_PROBLEMS.CERT_NOT_YET_VALID
    }
    if (isExpired(cert.to, now)) {
        return CERTIFICATE_PROBLEMS.CERT_EXPIRED
    }
    if (purpose === 'sign' && !cert.canSign) {
        return CERTIFICATE_PROBLEMS.UNSUPPORTED_KEY
    }
    if (purpose === 'sign' && !cert.hasPrivateKey) {
        return CERTIFICATE_PROBLEMS.CERT_NO_PRIVATE_KEY
    }
    if (!cert.isValid) {
        return CERTIFICATE_PROBLEMS.CERT_UNTRUSTED
    }
    return undefined
}

/**
 * Date for the message of a date problem: start of validity for `CERT_NOT_YET_VALID`, end for `CERT_EXPIRED`.
 *
 * @returns `undefined` for other problems
 */
export function getCertificateProblemDate(cert: Pick<CertificateData, 'from' | 'to'>, problem: CertificateProblem): Date | undefined {
    if (problem === CERTIFICATE_PROBLEMS.CERT_NOT_YET_VALID) {
        return cert.from
    }
    return problem === CERTIFICATE_PROBLEMS.CERT_EXPIRED ? cert.to : undefined
}
