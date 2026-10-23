import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { Form, notification, Select, Spin, Typography } from 'antd'
import { useAppSelector } from '@store'
import { actions } from '@actions'
import { CxBoxApiInstance } from 'api'
import { ApplicationErrorType, PendingDataItem } from '@cxbox-ui/core'
import styles from './CryptoGeneratorContent.module.less'
import { AppWidgetMeta, CryptoGeneratorItem, CryptoGeneratorTypes } from '@interfaces/widget'
import { buildBcUrl } from '@utils/buildBcUrl'
import moment from 'moment'
import CertificateInfo from '@components/CryptoGeneratorContent/CertificateInfo'
import { Trans, useTranslation } from 'react-i18next'
import { Lookup } from '@utils/Lookup'
import Switch from '@components/Switch/Switch'
import Case from '@components/Switch/Case'
import CertErrorPopup from '@components/CryptoGeneratorContent/CertErrorPopup'
import { cryptoProErrorMessage, cryptoProNotification } from '@components/CryptoGeneratorContent/cryptoProErrorMessage'
import {
    CertificateData,
    CertificatePurpose,
    CRYPTOPRO_LINKS,
    DEFAULT_SIGNATURE_PACKAGE,
    encrypt,
    encryptAndSign,
    ensureCadesPluginInstalled,
    getCertificateProblem,
    getCertificates,
    isCadesPluginError,
    SIGNATURE_PACKAGE,
    sign,
    signAndEncrypt,
    SignaturePackage,
    SignedAndEncrypted
} from '@features/cryptoPro'
import { DataItem } from '@cxbox-ui/schema'
import FieldBaseThemeWrapper from '@components/FieldBaseThemeWrapper/FieldBaseThemeWrapper'
import Button from '@components/ui/Button/Button'
import { DateFormat } from '@interfaces/date'

const SIGN_CONTENT_STATES = Lookup.create(['PLUGIN_ERROR', 'LOADING', 'CERTIFICATES_EMPTY', 'CERTIFICATES_FOUND'])

interface CryptoGeneratorContentProps {
    operationType: string
    meta: AppWidgetMeta
    onClose: () => void
    /**
     * Called when signing or encryption starts and ends. The popup uses it to block closing.
     */
    onInProgressChange?: (inProgress: boolean) => void
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }

    if (typeof error === 'string') {
        return error
    }
    // cryptopro
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message)
    }
    return String(error)
}

const resolveCryptoGeneratorType = (
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

const hasSignatureInGeneratorType = (generatorType: CryptoGeneratorTypes) =>
    generatorType === 'sign' || generatorType === 'signAndEncrypt' || generatorType === 'encryptAndSign'

const hasEncryptInGeneratorType = (generatorType: CryptoGeneratorTypes) =>
    generatorType === 'encrypt' || generatorType === 'signAndEncrypt' || generatorType === 'encryptAndSign'

const hasCombinedTypeInGeneratorType = (generatorType: CryptoGeneratorTypes) =>
    generatorType === 'signAndEncrypt' || generatorType === 'encryptAndSign'

function CryptoGeneratorContent({ operationType, meta, onClose, onInProgressChange }: CryptoGeneratorContentProps) {
    const { bcName, options, name: widgetName } = meta
    const { t } = useTranslation()

    const cryptoGenerator = options?.cryptoGenerator?.find(item => item.actionName === operationType)
    const {
        documentFileIdKey,
        documentFileNameKey,
        signatureFileIdKey,
        signatureFileNameKey,
        signatureFileBaseNameKey,
        signatureType,
        signaturePackage,
        actionName,
        encryptedFileIdKey,
        encryptedFileNameKey,
        encryptedFileBaseNameKey
    } = cryptoGenerator || {}

    const resolvedType: CryptoGeneratorTypes = resolveCryptoGeneratorType(cryptoGenerator)

    const dispatch = useDispatch()

    const { fileId, cursor, documentName, signatureFileBaseName, encryptedFileBaseName } = useAppSelector(state => {
        const cursor = state.screen.bo.bc[bcName].cursor
        const data = state.data[bcName].find(i => i.id === cursor)
        return {
            fileId: data?.[documentFileIdKey!] as string | undefined,
            cursor: cursor,
            documentName: data?.[documentFileNameKey!] ? String(data[documentFileNameKey!]) : undefined,
            signatureFileBaseName: String(data?.[signatureFileBaseNameKey!] ?? data?.[documentFileNameKey!] ?? 'signature'),
            encryptedFileBaseName: String(data?.[encryptedFileBaseNameKey!] ?? data?.[documentFileNameKey!] ?? 'encrypted_file')
        }
    }, shallowEqual)
    const [pluginUnavailable, setPluginUnavailable] = useState(false)

    /** Not expired certificates of the user; `undefined` while they are being read */
    const [certificates, setCertificates] = React.useState<CertificateData[] | undefined>(undefined)
    const [selectedSignCert, setSelectedSignCert] = React.useState<CertificateData | undefined>()
    const [selectedEncCert, setSelectedEncCert] = React.useState<CertificateData | undefined>()

    const [certificatesReadFailed, setCertificatesReadFailed] = useState(false)

    const [inProgress, setInProgress] = useState(false)

    useEffect(() => {
        if (certificates) {
            return
        }

        ;(async () => {
            try {
                await ensureCadesPluginInstalled()
            } catch (e) {
                console.error(e)
                setPluginUnavailable(true)
                return
            }

            try {
                setCertificates(await getCertificates())
            } catch (e) {
                console.error(e)
                setCertificatesReadFailed(true)
            }
        })()
    }, [certificates, dispatch])

    const updatePendingData = React.useCallback(
        (data: DataItem, pickMap: Record<string, string>) => {
            if (cursor) {
                const dataItemToUpdate: PendingDataItem = {}
                let dataExist: boolean = false

                Object.entries(pickMap).forEach(([saveKey, valueKey]) => {
                    dataItemToUpdate[saveKey] = data[valueKey]
                    dataExist = true
                })

                if (dataExist) {
                    dispatch?.(actions.changeDataItem({ bcName, cursor, dataItem: dataItemToUpdate, bcUrl: buildBcUrl(bcName, true) }))
                }
            }
        },
        [bcName, cursor, dispatch]
    )

    const executeCryptoAction = React.useCallback(
        async (generatorType: CryptoGeneratorTypes, currentSignaturePackage: SignaturePackage) => {
            if (!selectedSignCert && hasSignatureInGeneratorType(generatorType)) {
                return
            }

            if (!selectedEncCert && hasEncryptInGeneratorType(generatorType)) {
                return
            }

            setInProgress(true)
            onInProgressChange?.(true)

            try {
                if (!fileId) {
                    throw new Error('The record has no document file to sign or encrypt')
                }
                const response = await CxBoxApiInstance.getFile(fileId)
                const file = response.data

                // documentName goes into the signature: the signed document, for encryptAndSign — the .enc file
                const options = {
                    cadesType: signatureType,
                    signaturePackage: currentSignaturePackage,
                    documentName: generatorType === 'encryptAndSign' ? `${encryptedFileBaseName}.enc` : documentName
                }
                // signature / encrypted — the .sig / .enc files, base64 text
                const strategies: Record<CryptoGeneratorTypes, () => Promise<Partial<SignedAndEncrypted>>> = {
                    sign: () => sign(file, selectedSignCert!, options),
                    encrypt: () => encrypt(file, selectedEncCert!),
                    signAndEncrypt: () => signAndEncrypt(file, selectedSignCert!, selectedEncCert!, options),
                    encryptAndSign: () => encryptAndSign(file, selectedSignCert!, selectedEncCert!, options)
                }

                const { signature, encrypted } = await strategies[generatorType]()

                if (!signature && !encrypted) {
                    return
                }

                dispatch(actions.uploadFile(null))

                const isSingleOutputFile =
                    signatureFileIdKey === encryptedFileIdKey && !!signatureFileIdKey && hasCombinedTypeInGeneratorType(generatorType)

                const uploadAndUpdate = async (
                    resultFile: Blob,
                    extension: 'sig' | 'enc',
                    baseName: string,
                    idKey: string,
                    nameKey: string
                ) => {
                    const response = await CxBoxApiInstance.uploadFile(resultFile, `${baseName}.${extension}`)
                    updatePendingData(response.data.data, { [idKey]: 'id', [nameKey]: 'name' })
                }

                if (isSingleOutputFile) {
                    if (generatorType === 'signAndEncrypt' && encrypted) {
                        await uploadAndUpdate(encrypted, 'enc', encryptedFileBaseName, encryptedFileIdKey!, encryptedFileNameKey!)
                    } else if (generatorType === 'encryptAndSign' && signature) {
                        await uploadAndUpdate(signature, 'sig', signatureFileBaseName, signatureFileIdKey!, signatureFileNameKey!)
                    }
                } else {
                    if (signature && signatureFileIdKey && signatureFileNameKey) {
                        await uploadAndUpdate(signature, 'sig', signatureFileBaseName, signatureFileIdKey, signatureFileNameKey)
                    }
                    if (encrypted && encryptedFileIdKey && encryptedFileNameKey) {
                        await uploadAndUpdate(encrypted, 'enc', encryptedFileBaseName, encryptedFileIdKey, encryptedFileNameKey)
                    }
                }

                dispatch(actions.uploadFileDone(null))
                dispatch(actions.sendOperation({ bcName, widgetName, operationType: actionName as string }))
            } catch (err) {
                dispatch(actions.uploadFileFailed(null))

                console.error(err)
                if (isCadesPluginError(err)) {
                    const { type, key, params, description } = cryptoProNotification(err, {
                        signCert: selectedSignCert,
                        encCert: selectedEncCert
                    })
                    // an error stays until closed; a cancel goes away by itself
                    notification[type]({ message: t(key, params), description, duration: type === 'error' ? 0 : undefined })
                } else {
                    dispatch(
                        actions.showViewError({
                            error: {
                                type: ApplicationErrorType.BusinessError,
                                message: t('The operation could not be completed', { error: getErrorMessage(err) })
                            }
                        })
                    )
                }
            } finally {
                setInProgress(false)
                onInProgressChange?.(false)
                onClose()
            }
        },
        [
            selectedSignCert,
            selectedEncCert,
            onClose,
            onInProgressChange,
            fileId,
            dispatch,
            signatureFileIdKey,
            encryptedFileIdKey,
            bcName,
            widgetName,
            actionName,
            signatureType,
            updatePendingData,
            documentName,
            encryptedFileBaseName,
            encryptedFileNameKey,
            signatureFileBaseName,
            signatureFileNameKey,
            t
        ]
    )

    const [currentPackage, setCurrentPackage] = useState<SignaturePackage>(
        signaturePackage && signaturePackage !== 'any' ? signaturePackage : DEFAULT_SIGNATURE_PACKAGE
    )

    const handleExecute = async () => {
        await executeCryptoAction(resolvedType, currentPackage)
    }

    const currentState = useMemo(() => {
        if (pluginUnavailable) {
            return SIGN_CONTENT_STATES.PLUGIN_ERROR
        }
        if (!certificates) {
            // also after a read failure, as before: the popup tells about it
            return SIGN_CONTENT_STATES.LOADING
        }
        return certificates.length ? SIGN_CONTENT_STATES.CERTIFICATES_FOUND : SIGN_CONTENT_STATES.CERTIFICATES_EMPTY
    }, [certificates, pluginUnavailable])

    const createCertSelect = useCallback(
        (value: string | undefined, onChange: (value: string | undefined) => void, purpose: CertificatePurpose) => {
            return (
                <Select value={value} onChange={onChange} style={{ width: '100%' }}>
                    {certificates?.map(cert => {
                        // a problem is only marked: the plugin decides at the operation, as before
                        const problem = getCertificateProblem(cert, { purpose })
                        const problemMessage = problem && cryptoProErrorMessage(problem, cert)
                        return (
                            <Select.Option key={cert.thumbprint} value={cert.thumbprint}>
                                {t('Certification issued', {
                                    name: cert.name,
                                    from: moment(cert.from).format(DateFormat.outputDateTimeWithSecondsFormat)
                                })}
                                {problemMessage && ` — ${t(problemMessage.key, problemMessage.params)}`}
                            </Select.Option>
                        )
                    })}
                </Select>
            )
        },
        [certificates, t]
    )

    return (
        <>
            <Switch test={currentState}>
                <Case value={SIGN_CONTENT_STATES.PLUGIN_ERROR}>
                    <Typography className={styles.typography}>
                        <Trans
                            i18nKey="Cryptopro plugin error"
                            components={[
                                <a key="0" href={CRYPTOPRO_LINKS.INSTRUCTION_URL} target="_blank" rel="noreferrer">
                                    placeholder
                                </a>
                            ]}
                        />
                    </Typography>
                </Case>

                <Case value={SIGN_CONTENT_STATES.LOADING}>
                    <Typography>
                        {t('Search for certificates...')} <Spin spinning />
                    </Typography>
                </Case>

                <Case value={SIGN_CONTENT_STATES.CERTIFICATES_EMPTY}>
                    <Typography className={styles.typography}>
                        <Trans
                            i18nKey="Certificate empty error"
                            components={[
                                <a key="0" href={CRYPTOPRO_LINKS.INSTRUCTION_URL} target="_blank" rel="noreferrer">
                                    placeholder
                                </a>
                            ]}
                        />
                    </Typography>
                </Case>

                <Case value={SIGN_CONTENT_STATES.CERTIFICATES_FOUND}>
                    <FieldBaseThemeWrapper className={styles.container}>
                        <Form>
                            {signaturePackage === 'any' && (
                                <Form.Item label={t('Signature type')} className={styles.formItem}>
                                    <Select value={currentPackage} onChange={value => setCurrentPackage(value)} style={{ width: '100%' }}>
                                        {Lookup.values(SIGNATURE_PACKAGE).map(i => (
                                            <Select.Option key={i} value={i}>
                                                {t(i)}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}

                            {hasSignatureInGeneratorType(resolvedType) && (
                                <>
                                    <Form.Item label={t('Signing certificate')} className={styles.formItem}>
                                        {createCertSelect(
                                            selectedSignCert?.thumbprint,
                                            value => setSelectedSignCert(certificates?.find(cert => cert.thumbprint === value)),
                                            'sign'
                                        )}
                                    </Form.Item>
                                    <CertificateInfo data={selectedSignCert} />
                                </>
                            )}

                            {hasEncryptInGeneratorType(resolvedType) && (
                                <>
                                    <Form.Item label={t('Certificate for encryption')} className={styles.formItem}>
                                        {createCertSelect(
                                            selectedEncCert?.thumbprint,
                                            value => setSelectedEncCert(certificates?.find(cert => cert.thumbprint === value)),
                                            'encrypt'
                                        )}
                                    </Form.Item>
                                    <CertificateInfo data={selectedEncCert} purpose="encrypt" />
                                </>
                            )}
                        </Form>

                        <Button
                            onClick={handleExecute}
                            loading={inProgress}
                            disabled={
                                (hasSignatureInGeneratorType(resolvedType) && !selectedSignCert) ||
                                (hasEncryptInGeneratorType(resolvedType) && !selectedEncCert)
                            }
                        >
                            {t('Execute')}
                        </Button>
                    </FieldBaseThemeWrapper>
                </Case>
            </Switch>

            <CertErrorPopup hasError={certificatesReadFailed} onClose={() => setCertificatesReadFailed(false)} />
        </>
    )
}

export default React.memo(CryptoGeneratorContent)
