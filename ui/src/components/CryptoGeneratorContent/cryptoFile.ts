import { CxBoxApiInstance } from 'api'
import { DataItem } from '@cxbox-ui/schema'
import { AppWidgetMeta, CryptoGeneratorItem, CryptoGeneratorTypes } from '@interfaces/widget'
import {
    CadesPluginError,
    CertificateData,
    encrypt,
    encryptAndSign,
    getCertificateProblem,
    OperationOptions,
    sign,
    signAndEncrypt,
    SignaturePackage,
    SignatureType,
    SignedAndEncrypted
} from '@features/cryptoPro'

export interface CryptoSettings {
    generatorType: CryptoGeneratorTypes
    signaturePackage: SignaturePackage
    signatureType?: SignatureType
    signCert?: CertificateData
    encCert?: CertificateData
}

/**
 * The `.sig` and `.enc` files made from one document, base64 text
 */
export type CryptoData = Partial<SignedAndEncrypted>

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

interface CryptoOperation {
    /**
     * Needs the signing certificate
     */
    signs: boolean
    /**
     * Needs the recipient certificate
     */
    encrypts: boolean
    run: (file: Blob, certs: Pick<CryptoSettings, 'signCert' | 'encCert'>, options: OperationOptions) => Promise<CryptoData>
}

/**
 * The operations of `type` of `cryptoGenerator`: what they need and how they run
 */
const CRYPTO_OPERATIONS: Record<CryptoGeneratorTypes, CryptoOperation> = {
    sign: { signs: true, encrypts: false, run: (file, { signCert }, options) => sign(file, signCert!, options) },
    encrypt: { signs: false, encrypts: true, run: (file, { encCert }, { signal }) => encrypt(file, encCert!, { signal }) },
    signAndEncrypt: {
        signs: true,
        encrypts: true,
        run: (file, { signCert, encCert }, options) => signAndEncrypt(file, signCert!, encCert!, options)
    },
    encryptAndSign: {
        signs: true,
        encrypts: true,
        run: (file, { signCert, encCert }, options) => encryptAndSign(file, signCert!, encCert!, options)
    }
}

export const CRYPTO_GENERATOR_TYPES = Object.keys(CRYPTO_OPERATIONS) as readonly CryptoGeneratorTypes[]

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

export const hasSignatureInGeneratorType = (generatorType: CryptoGeneratorTypes) => !!CRYPTO_OPERATIONS[generatorType]?.signs

export const hasEncryptInGeneratorType = (generatorType: CryptoGeneratorTypes) => !!CRYPTO_OPERATIONS[generatorType]?.encrypts

const hasCombinedTypeInGeneratorType = (generatorType: CryptoGeneratorTypes) =>
    hasSignatureInGeneratorType(generatorType) && hasEncryptInGeneratorType(generatorType)

/**
 * Runs the operation of the type with the certificates it needs
 */
export function runOperation(
    generatorType: CryptoGeneratorTypes,
    file: Blob,
    certs: Pick<CryptoSettings, 'signCert' | 'encCert'>,
    options: OperationOptions = {}
): Promise<CryptoData> {
    const operation = CRYPTO_OPERATIONS[generatorType]

    if (!operation) {
        throw new Error(`Unknown type "${generatorType}" of options.cryptoGenerator, expected: ${CRYPTO_GENERATOR_TYPES.join(', ')}`)
    }

    return operation.run(file, certs, options)
}

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
 * Name of the signed document for the signature: the document itself, for `encryptAndSign` — its `.enc` file
 */
export const getSignedDocumentName = (
    generatorType: CryptoGeneratorTypes,
    documentName: string | undefined,
    { encryptedFileBaseName }: Pick<CryptoFileBaseNames, 'encryptedFileBaseName'>
) => (generatorType === 'encryptAndSign' ? `${encryptedFileBaseName}.enc` : documentName)

/**
 * Throws, if the encryption certificate has a problem: the plugin itself encrypts with an expired certificate
 * or one with a broken chain, while signing refuses them
 */
export function validateEncryptionCertificate({ generatorType, encCert }: Pick<CryptoSettings, 'generatorType' | 'encCert'>) {
    const problem = hasEncryptInGeneratorType(generatorType) && encCert && getCertificateProblem(encCert, { purpose: 'encrypt' })

    if (problem) {
        throw new CadesPluginError(problem)
    }
}

/**
 * Signs and/or encrypts one file with the CryptoPro plugin
 */
export async function createCryptoData(
    file: Blob,
    { generatorType, signaturePackage, signatureType, signCert, encCert }: CryptoSettings,
    { documentName, signal }: { documentName?: string; signal?: AbortSignal } = {}
): Promise<CryptoData> {
    // before signing: with signAndEncrypt a refused certificate would leave a signature without the encrypted file
    validateEncryptionCertificate({ generatorType, encCert })

    return runOperation(generatorType, file, { signCert, encCert }, { cadesType: signatureType, signaturePackage, documentName, signal })
}

/**
 * Saves the results of {@link createCryptoData} to the file storage.
 * Which files are saved is set by the keys of `cryptoGenerator`: the same keys work for one record and for mass signing.
 */
export async function uploadCryptoData(
    { signature, encrypted }: CryptoData,
    generatorType: CryptoGeneratorTypes,
    {
        signatureFileIdKey,
        signatureFileNameKey,
        encryptedFileIdKey,
        encryptedFileNameKey
    }: Pick<CryptoGeneratorItem, 'signatureFileIdKey' | 'signatureFileNameKey' | 'encryptedFileIdKey' | 'encryptedFileNameKey'>,
    { signatureFileBaseName, encryptedFileBaseName }: CryptoFileBaseNames
): Promise<CryptoFiles> {
    const upload = async (file: Blob, extension: 'sig' | 'enc', baseName: string): Promise<CryptoFile> => {
        const response = await CxBoxApiInstance.uploadFile(file, `${baseName}.${extension}`)
        return response.data.data
    }

    const isSingleOutputFile =
        signatureFileIdKey === encryptedFileIdKey && !!signatureFileIdKey && hasCombinedTypeInGeneratorType(generatorType)

    if (isSingleOutputFile) {
        if (generatorType === 'signAndEncrypt' && encrypted) {
            return { encrypted: await upload(encrypted, 'enc', encryptedFileBaseName) }
        }
        if (generatorType === 'encryptAndSign' && signature) {
            return { signature: await upload(signature, 'sig', signatureFileBaseName) }
        }
        return {}
    }

    const files: CryptoFiles = {}
    if (signature && signatureFileIdKey && signatureFileNameKey) {
        files.signature = await upload(signature, 'sig', signatureFileBaseName)
    }
    if (encrypted && encryptedFileIdKey && encryptedFileNameKey) {
        files.encrypted = await upload(encrypted, 'enc', encryptedFileBaseName)
    }
    return files
}
