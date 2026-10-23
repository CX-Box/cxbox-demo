import { SignatureType } from './constants'

/** Certificate object of the plugin (async API). */
export interface CertificateAsync extends CAPICOM.CertificateAsync {}

/** Certificate from the store with the properties shown in the UI; read once by {@link getCertificates}. */
export interface CertificateData {
    /** Subject name, `GetInfo(0)` */
    name: string
    /** Start of validity */
    from: Date
    /** End of validity */
    to: Date
    /** Subject e-mail, `GetInfo(2)` */
    email: string
    /** Issuer name, `GetInfo(1)` */
    provider: string
    /** Issuer e-mail, `GetInfo(3)` */
    providerEmail: string
    /** The plugin object, passed to the plugin for signing and encryption */
    itself: CertificateAsync
    /** Result of `IsValid()` (chain check); `false` for an expired certificate without the check */
    isValid: boolean
    /** Whether the certificate is linked to a private key container: needed to sign, not to encrypt for this recipient */
    hasPrivateKey: boolean
    /** Key algorithm name for the user, e.g. «ГОСТ Р 34.10-2012 256 бит» */
    algorithmFriendlyName: string
    /** Public key, base64 */
    publicKeyValue: string
    /** Provider of the private key; `undefined` without a private key */
    cryptoProvider?: string
    /** Container name of the private key; `undefined` without a private key */
    privateKeyLink?: string
    /** SHA-1 thumbprint, upper case hex: identifies the certificate in lists */
    thumbprint: string
    /** OID of the public key algorithm, e.g. `1.2.643.7.1.1.1.1` */
    keyAlgorithmOid: string
    /** Whether the key can sign: its algorithm has a hash in `resolveHashAlgorithm`. Encryption does not depend on it */
    canSign: boolean
}

/** What the certificate is used for: `sign` — the signer's own certificate, `encrypt` — the recipient of encryption */
export type CertificatePurpose = 'sign' | 'encrypt'

/** Signature settings; every field is optional */
export interface SignOptions {
    /** @defaultValue `CADES_BES` */
    cadesType?: SignatureType
    /** Time stamp service, required for `CADES_T`. @defaultValue `REACT_APP_CRYPTOPRO_TSA_URL` */
    tsaUrl?: string
    /**
     * Name of the signed document, put into the documentName signed attribute: the recipient sees it in the signature properties.
     * @defaultValue `DEFAULT_DOCUMENT_NAME` (`'Document Name'`, as before)
     */
    documentName?: string
}

/** A created signature */
export interface SignResult {
    /** CMS SignedData as base64 text — the `.sig` file */
    signature: Blob
    /** How an attached signature was made: `SignCades` of the whole file or assembled from a detached one; `undefined` for a detached one */
    method?: 'native' | 'assembled'
}

/** An encrypted file */
export interface EncryptResult {
    /** CMS EnvelopedData as base64 text — the `.enc` file */
    encrypted: Blob
}

/**
 * A signature as the signing functions of the module return it: with its DER, to encrypt the signature itself
 * in `signAndEncrypt` without decoding the base64 text.
 *
 * @internal
 */
export interface SignedCms extends SignResult {
    der: Blob
}

/**
 * Contract of the optional `attachedAssembly` module. Declared here, not in the module,
 * so that the rest of the code compiles when the module is removed (see `attachedAssembly/index.ts`).
 */
export interface AttachedAssembly {
    signAttachedAssembled(file: Blob, cert: CertificateData, options?: SignOptions): Promise<SignedCms>
}

// Additions to @types/cadesplugin: what the package lacks or types too strictly. Moved from `interfaces/sign.ts` as is
// (projects may rely on them), plus `StreamEncrypt`.
declare global {
    interface CADESPluginBase {
        async_spawn<T, TValue = any, TReason = any>(
            generatorFun: (args: [(value?: TValue) => void, (reason?: TReason) => void]) => Iterator<T>,
            resolve: (value?: TValue) => void,
            reject: (reason?: TReason) => void
        ): Promise<any>
        async_spawn<T, TArgs extends any[]>(generatorFun: (...args: TArgs[]) => Iterator<T>, ...args: TArgs): T
    }

    interface Window {
        cadesplugin: CADESPlugin
    }

    namespace CAdESCOM {
        interface CPEnvelopedDataAsync extends CADES_Common.Async<unknown> {
            Recipients: Promise<{
                Add(certificate: CertificateAsync): Promise<void>
            }>
            propset_ContentEncoding(encodingType: number): Promise<void>
            propset_Content(content: string): Promise<void>
            Encrypt(encodingType: number): Promise<string>
            /** Encrypts the next part (base64); returns base64 of the encrypted part, possibly empty. Since plugin 2.0.13027 */
            StreamEncrypt(data: string, isFinal: boolean): Promise<string>
        }
    }

    namespace CADES_Plugin {
        interface ObjectNamesAsync {
            'CAdESCOM.CPEnvelopedData': CAdESCOM.CPEnvelopedDataAsync
        }
    }

    namespace CAPICOM {
        interface Store {
            Open(
                /**
                 * @see https://docs.cryptopro.ru/cades/plugin/plugin-samples/plugin-samples-cadescom-container-store
                 */
                location?: CADES_Common.ValuesOf<CAPICOM_STORE_LOCATION> | CAdESCOM.CADESCOM_STORE_LOCATION['CADESCOM_CONTAINER_STORE'],
                name?: CADES_Common.ValuesOf<CAPICOM_STORE_NAME>,
                openMode?: CADES_Common.ValuesOf<CAPICOM_STORE_OPEN_MODE>
            ): void
        }

        interface Certificate {
            GetInfo(infoType: number): string
        }
    }
}
