import { CxBoxApiInstance } from 'api'
import { DataItem } from '@cxbox-ui/schema'
import { CertificateData } from '@interfaces/sign'
import { AppWidgetMeta, CryptoGeneratorItem, CryptoGeneratorTypes } from '@interfaces/widget'
import { SignaturePackage, SignatureType } from '@constants/cadesPlugin'
import createVerifiedSignature from '@utils/cadesPlugin/createVerifiedSignature'
import { encryptData } from '@utils/cadesPlugin/encryptData'
import { base64ToPemBlob } from '@utils/cadesPlugin/base64ToPemBlob'

export interface CryptoSettings {
    generatorType: CryptoGeneratorTypes
    signaturePackage: SignaturePackage
    signatureType?: SignatureType
    signCert?: CertificateData
    encCert?: CertificateData
}

export interface CryptoData {
    signatureBase64?: string
    encryptedBase64?: string
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

/**
 * Settings of CryptoPro for the action: an item of `options.cryptoGenerator` of the widget
 */
export const getCryptoGenerator = (widget: AppWidgetMeta | undefined, actionName: string | undefined) =>
    widget?.options?.cryptoGenerator?.find(item => item.actionName === actionName)

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
 * Signs and/or encrypts one file with the CryptoPro plugin.
 * `verify: false` skips the check of the created signature: mass signing checks it only until the first success.
 */
export async function createCryptoData(
    file: Blob,
    { generatorType, signaturePackage, signatureType, signCert, encCert }: CryptoSettings,
    verify: boolean = true
): Promise<CryptoData> {
    const sign = (data: Blob | string) =>
        createVerifiedSignature(signCert!.itself, data, {
            cadesType: signatureType,
            signaturePackage,
            verify
        })
    const encrypt = (data: Blob | string) => encryptData(encCert!.itself, data)

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
                encryptedBase64: await encrypt(dataToEncrypt)
            }
        },
        encryptAndSign: async () => {
            const encryptedBase64 = await encrypt(file)

            if (!encryptedBase64) {
                return {}
            }
            const encryptedBlob = base64ToPemBlob(encryptedBase64)

            return {
                encryptedBase64,
                signatureBase64: await sign(encryptedBlob)
            }
        }
    }

    return strategies[generatorType]()
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
    const upload = async (base64: string, extension: 'sig' | 'enc', baseName: string): Promise<CryptoFile> => {
        const response = await CxBoxApiInstance.uploadFile(base64ToPemBlob(base64), `${baseName}.${extension}`)
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
