import { t } from 'i18next'
import { CxBoxApiInstance } from 'api'
import { DataItem } from '@cxbox-ui/schema'
import { CertificateData } from '@interfaces/sign'
import { AppWidgetMeta, CryptoGeneratorItem, CryptoGeneratorTypes } from '@interfaces/widget'
import { SignaturePackage, SignatureType } from '@constants/cadesPlugin'
import createVerifiedSignature from '@utils/cadesPlugin/createVerifiedSignature'
import { encryptData } from '@utils/cadesPlugin/encryptData'
import { Base64Text, CryptoInput, CryptoPartsOptions, toTextBlob } from '@utils/cadesPlugin/base64Data'
import {
    checkMaxFileSize,
    checkRecipientFileSize,
    fitsPluginMessageSize,
    getLargestWholeSignedFileSize,
    toMegabytes
} from '@utils/cadesPlugin/checkPluginDataSize'
import { getHashAlgorithmByKeyOid, getHashSigningAlgorithm } from '@utils/cadesPlugin/hashData'
import { checkStreamEncrypt } from '@utils/cadesPlugin/streamEncrypt'
import { resultDamaged } from '@utils/cadesPlugin/cryptoResult'

export interface CryptoSettings {
    generatorType: CryptoGeneratorTypes
    signaturePackage: SignaturePackage
    signatureType?: SignatureType
    signCert?: CertificateData
    encCert?: CertificateData
}

/**
 * Results of signing and/or encryption: base64 of the signature and of the encrypted file, `Base64Text` for large data
 */
export interface CryptoData {
    signatureBase64?: string | Base64Text
    encryptedBase64?: string | Base64Text
}

/**
 * Progress is shown only for a file larger than this, bytes. The file has parts only when its base64
 * (or the base64 of the data made from it) is longer than `PLUGIN_MESSAGE_LIMIT`
 */
export const LARGE_FILE_SIZE = 10 * 1024 * 1024

/**
 * The document downloaded to be signed or encrypted. A download cut short would be signed as if it were the whole
 * document, and the signature would not match the document of the record, so its size is checked by `Content-Length`.
 * The header is not compared when the response is compressed: then it is the size of the compressed data
 *
 * @throws CadesPluginError `RESULT_DAMAGED` when the size differs from `Content-Length` of an uncompressed response
 */
export function getDownloadedFile({ data, headers }: { data: Blob; headers: unknown }): Blob {
    const header = (name: string) => (headers as Record<string, unknown> | undefined)?.[name]
    const expected = Number(header('content-length'))
    if (!header('content-encoding') && Number.isFinite(expected) && expected > 0 && data.size !== expected) {
        throw resultDamaged(`the document is downloaded not whole: ${data.size} of ${expected} bytes`)
    }
    return data
}

/**
 * Progress of {@link createCryptoData} on a large file
 */
export interface CryptoProgress {
    /** What is done now */
    stage: 'sign' | 'encrypt'
    /** Number of the stage, from 1 */
    step: number
    /** Number of the stages: 2 for signing and encryption together */
    steps: number
    /** Number of the part of the stage, from 1 */
    part: number
    /** Number of the parts of the stage */
    total: number
}

export interface CryptoDataOptions {
    /** Called after each part of a large file */
    onProgress?: (progress: CryptoProgress) => void
    /** Checked between the parts: `true` stops the operation with the error "Interrupted" */
    isInterrupted?: () => boolean
}

export interface CryptoFile {
    id: string
    name: string
}

export interface CryptoFiles {
    signature?: CryptoFile
    encrypted?: CryptoFile
}

export interface CryptoFileBaseNames {
    signatureFileBaseName: string
    encryptedFileBaseName: string
}

export const CRYPTO_GENERATOR_TYPES: readonly CryptoGeneratorTypes[] = ['sign', 'encrypt', 'signAndEncrypt', 'encryptAndSign']

/**
 * `type` of the settings is not one of `CRYPTO_GENERATOR_TYPES`: a mistake in the widget meta, nothing can be signed
 */
export const hasInvalidCryptoGeneratorType = (cryptoGenerator?: CryptoGeneratorItem) =>
    !!cryptoGenerator?.type && !CRYPTO_GENERATOR_TYPES.includes(cryptoGenerator.type)

/**
 * Settings of CryptoPro for the action: an item of `options.cryptoGenerator` of the widget
 */
export const getCryptoGenerator = (widget: AppWidgetMeta | undefined, actionName: string | undefined) =>
    widget?.options?.cryptoGenerator?.find(item => item.actionName === actionName)

/**
 * What the action does: `type` of the settings, or, without it, the result files that the settings have keys for
 */
export const resolveCryptoGeneratorType = (
    {
        type: cryptoGeneratorType,
        signatureFileIdKey,
        signatureFileNameKey,
        encryptedFileIdKey,
        encryptedFileNameKey
    }: CryptoGeneratorItem = {} as CryptoGeneratorItem
) => {
    const hasSignConfig = !!(signatureFileIdKey || signatureFileNameKey)
    const hasEncryptConfig = !!(encryptedFileIdKey || encryptedFileNameKey)

    let resolvedType: CryptoGeneratorTypes = cryptoGeneratorType || 'sign'

    if (!cryptoGeneratorType) {
        if (hasSignConfig && !hasEncryptConfig) {
            resolvedType = 'sign'
        } else if (!hasSignConfig && hasEncryptConfig) {
            resolvedType = 'encrypt'
        } else if (hasSignConfig && hasEncryptConfig) {
            resolvedType = 'encryptAndSign'
        }
    }

    return resolvedType
}

export const hasSignatureInGeneratorType = (generatorType: CryptoGeneratorTypes) =>
    generatorType === 'sign' || generatorType === 'signAndEncrypt' || generatorType === 'encryptAndSign'

export const hasEncryptInGeneratorType = (generatorType: CryptoGeneratorTypes) =>
    generatorType === 'encrypt' || generatorType === 'signAndEncrypt' || generatorType === 'encryptAndSign'

const hasCombinedTypeInGeneratorType = (generatorType: CryptoGeneratorTypes) =>
    generatorType === 'signAndEncrypt' || generatorType === 'encryptAndSign'

export const getCryptoFileBaseNames = (
    record: DataItem | undefined,
    {
        documentFileNameKey,
        signatureFileBaseNameKey,
        encryptedFileBaseNameKey
    }: Pick<CryptoGeneratorItem, 'documentFileNameKey' | 'signatureFileBaseNameKey' | 'encryptedFileBaseNameKey'>
): CryptoFileBaseNames => ({
    signatureFileBaseName: String(record?.[signatureFileBaseNameKey!] ?? record?.[documentFileNameKey!] ?? 'signature'),
    encryptedFileBaseName: String(record?.[encryptedFileBaseNameKey!] ?? record?.[documentFileNameKey!] ?? 'encrypted_file')
})

/**
 * The smallest size of the `.enc` file as text, bytes: base64 of the encrypted message without the CMS around the data;
 * the plugin breaks the base64 of small data into lines
 */
const encryptedTextSize = (size: number) => {
    const base64 = Math.ceil(size / 3) * 4
    return fitsPluginMessageSize(size) ? Math.ceil((base64 / 64) * 66) : base64
}

/**
 * Checks the limits and the plugin before signing and encryption: the user should not wait for a result that is thrown away then.
 * Everything is checked by the smallest size of the data (without the CMS a signature or encryption adds),
 * so nothing that would work is refused here; each operation checks the exact size again.
 * Near a border the work may still fail after the first stage: the signature is a few KB larger than the file
 */
async function checkBeforeStart(file: Blob, { generatorType, signaturePackage, signCert }: CryptoSettings) {
    checkMaxFileSize(file.size)
    const isAttached = signaturePackage === 'attached'

    if (hasEncryptInGeneratorType(generatorType)) {
        checkRecipientFileSize(file.size, 'encrypt')
        if (!fitsPluginMessageSize(file.size)) {
            await checkStreamEncrypt()
        }
    }

    if (hasSignatureInGeneratorType(generatorType)) {
        // encrypt and sign signs the .enc file: base64 text, 4/3 of the file
        const isEncryptedSigned = generatorType === 'encryptAndSign'
        if (isAttached) {
            if (isEncryptedSigned) {
                checkRecipientFileSize(encryptedTextSize(file.size), 'signEncrypted')
            } else {
                checkRecipientFileSize(file.size, 'sign')
            }
        }
        if (!fitsPluginMessageSize(isEncryptedSigned ? encryptedTextSize(file.size) : file.size)) {
            await getHashSigningAlgorithm(signCert!.itself, getLargestWholeSignedFileSize(isEncryptedSigned))
        }
    }
}

/**
 * Warning under the signing certificate when its key is not GOST: such a certificate signs only files that go
 * to the plugin whole. The size of the file is not known before it is downloaded, so the limit is named in advance
 *
 * @returns `undefined` for a GOST certificate, or when there is no certificate or its `keyAlgorithmOid`
 */
export function getSignCertificateWarning(certificate: CertificateData | undefined, generatorType: CryptoGeneratorTypes) {
    const oid = certificate?.keyAlgorithmOid
    if (!oid || getHashAlgorithmByKeyOid(oid)) {
        return undefined
    }
    return t('Not GOST certificate', {
        algorithm: certificate.algorithmFriendlyName || oid,
        max: toMegabytes(getLargestWholeSignedFileSize(generatorType === 'encryptAndSign'), Math.floor)
    })
}

/**
 * Signs and/or encrypts one file with the CryptoPro plugin.
 * `verify: false` skips the check of a signature made whole: mass signing checks it only until the first success.
 * A signature by the hash of a large file is always checked.
 * `onProgress` and `isInterrupted` are called between the parts of a large file passed to the plugin.
 *
 * @throws CadesPluginError `FILE_TOO_LARGE` for a file larger than `MAX_CRYPTO_FILE_SIZE`,
 * or than `RECIPIENT_MAX_FILE_SIZE` for an attached signature or encryption;
 * `UNSUPPORTED_KEY_ALGORITHM` and `PLUGIN_OUTDATED` for a large file, before the file is passed to the plugin;
 * `PLUGIN_NOT_RESPONDING` when the plugin does not answer a part in `PLUGIN_PART_TIMEOUT`;
 * `RESULT_DAMAGED` when the downloaded file or a result assembled from parts is not whole;
 * `SIGNATURE_VERIFICATION_FAILED` when the created signature is not valid;
 * Error "Interrupted" when `isInterrupted` returns `true`
 */
export async function createCryptoData(
    file: Blob,
    settings: CryptoSettings,
    verify: boolean = true,
    { onProgress, isInterrupted }: CryptoDataOptions = {}
): Promise<CryptoData> {
    const { generatorType, signaturePackage, signatureType, signCert, encCert } = settings
    await checkBeforeStart(file, settings)

    const steps = hasCombinedTypeInGeneratorType(generatorType) ? 2 : 1
    const partsOptions = (stage: CryptoProgress['stage'], step: number): CryptoPartsOptions => ({
        isInterrupted,
        onProgress: onProgress && ((part, total) => onProgress({ stage, step, steps, part, total }))
    })

    const sign = (data: CryptoInput, step: number = 1) =>
        createVerifiedSignature(signCert!.itself, data, {
            cadesType: signatureType,
            signaturePackage,
            verify,
            ...partsOptions('sign', step)
        })
    const encrypt = (data: CryptoInput, step: number = 1) => encryptData(encCert!.itself, data, partsOptions('encrypt', step))

    const strategies: Record<CryptoGeneratorTypes, () => Promise<CryptoData>> = {
        sign: async () => ({
            signatureBase64: await sign(file)
        }),
        encrypt: async () => ({
            encryptedBase64: await encrypt(file)
        }),
        signAndEncrypt: async () => {
            const signatureBase64 = await sign(file)

            if (!signatureBase64) {
                return {}
            }

            const dataToEncrypt = signaturePackage === 'attached' ? signatureBase64 : file
            return {
                signatureBase64,
                encryptedBase64: await encrypt(dataToEncrypt, 2)
            }
        },
        encryptAndSign: async () => {
            const encryptedBase64 = await encrypt(file)

            if (!encryptedBase64) {
                return {}
            }
            // the signature is of the .enc file as it is stored: base64 text
            return {
                encryptedBase64,
                signatureBase64: await sign(toTextBlob(encryptedBase64), 2)
            }
        }
    }

    const strategy = strategies[generatorType]

    if (!strategy) {
        throw new Error(`Unknown type "${generatorType}" of options.cryptoGenerator, expected: ${CRYPTO_GENERATOR_TYPES.join(', ')}`)
    }

    return strategy()
}

/**
 * Saves the results of {@link createCryptoData} to the file storage.
 * Which files are saved is set by the keys of `cryptoGenerator`: the same keys work for one record and for mass signing.
 */
export async function uploadCryptoData(
    { signatureBase64, encryptedBase64 }: CryptoData,
    generatorType: CryptoGeneratorTypes,
    {
        signatureFileIdKey,
        signatureFileNameKey,
        encryptedFileIdKey,
        encryptedFileNameKey
    }: Pick<CryptoGeneratorItem, 'signatureFileIdKey' | 'signatureFileNameKey' | 'encryptedFileIdKey' | 'encryptedFileNameKey'>,
    { signatureFileBaseName, encryptedFileBaseName }: CryptoFileBaseNames
): Promise<CryptoFiles> {
    const upload = async (base64: string | Base64Text, extension: 'sig' | 'enc', baseName: string): Promise<CryptoFile> => {
        const response = await CxBoxApiInstance.uploadFile(toTextBlob(base64), `${baseName}.${extension}`)
        return response.data.data
    }

    const isSingleOutputFile =
        signatureFileIdKey === encryptedFileIdKey && !!signatureFileIdKey && hasCombinedTypeInGeneratorType(generatorType)

    if (isSingleOutputFile) {
        if (generatorType === 'signAndEncrypt' && encryptedBase64) {
            return { encrypted: await upload(encryptedBase64, 'enc', encryptedFileBaseName) }
        }
        if (generatorType === 'encryptAndSign' && signatureBase64) {
            return { signature: await upload(signatureBase64, 'sig', signatureFileBaseName) }
        }
        return {}
    }

    const files: CryptoFiles = {}
    if (signatureBase64 && signatureFileIdKey && signatureFileNameKey) {
        files.signature = await upload(signatureBase64, 'sig', signatureFileBaseName)
    }
    if (encryptedBase64 && encryptedFileIdKey && encryptedFileNameKey) {
        files.encrypted = await upload(encryptedBase64, 'enc', encryptedFileBaseName)
    }
    return files
}
