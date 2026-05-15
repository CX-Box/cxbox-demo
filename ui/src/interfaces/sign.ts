export interface CertificateAsync extends CAPICOM.CertificateAsync {}

export interface CertificateData {
    name: string
    from: Date
    to: Date
    email: string
    provider: string
    providerEmail: string
    itself: CertificateAsync
    isValid: boolean
    hasPrivateKey: boolean
    algorithmFriendlyName: string
    publicKeyValue: string
    cryptoProvider?: string
    privateKeyLink?: string
}

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
