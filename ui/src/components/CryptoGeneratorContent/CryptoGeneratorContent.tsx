import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { Form, Select, Spin, Typography } from 'antd'
import { useAppSelector } from '@store'
import { actions } from '@actions'
import { CxBoxApiInstance } from 'api'
import { ApplicationErrorType, PendingDataItem } from '@cxbox-ui/core'
import styles from './CryptoGeneratorContent.module.less'
import { AppWidgetMeta, CryptoGeneratorTypes } from '@interfaces/widget'
import { buildBcUrl } from '@utils/buildBcUrl'
import moment from 'moment'
import CertificateInfo from '@components/CryptoGeneratorContent/CertificateInfo'
import { Trans, useTranslation } from 'react-i18next'
import { Lookup } from '@utils/Lookup'
import Switch from '@components/Switch/Switch'
import Case from '@components/Switch/Case'
import CertErrorPopup from '@components/CryptoGeneratorContent/CertErrorPopup'
import { openNotification } from '@components/NotificationsContainer/utils'
import { cryptoProErrorMessage, cryptoProNotification } from '@components/CryptoGeneratorContent/cryptoProErrorMessage'
import {
    CertificateData,
    CertificatePurpose,
    CRYPTOPRO_LINKS,
    DEFAULT_SIGNATURE_PACKAGE,
    ensureCadesPluginInstalled,
    getCertificateProblem,
    getCertificates,
    isCadesPluginError,
    isNativeAttached,
    SIGNATURE_PACKAGE,
    SignaturePackage
} from '@features/cryptoPro'
import FieldBaseThemeWrapper from '@components/FieldBaseThemeWrapper/FieldBaseThemeWrapper'
import Button from '@components/ui/Button/Button'
import { DateFormat } from '@interfaces/date'
import {
    CRYPTO_GENERATOR_TYPES,
    createCryptoData,
    CryptoFile,
    CryptoSettings,
    getCryptoFileBaseNames,
    getCryptoGenerator,
    getSignedDocumentName,
    hasEncryptInGeneratorType,
    hasInvalidCryptoGeneratorType,
    hasSignatureInGeneratorType,
    resolveCryptoGeneratorType,
    uploadCryptoData
} from '@components/CryptoGeneratorContent/cryptoFile'

const SIGN_CONTENT_STATES = Lookup.create(['CONFIG_ERROR', 'PLUGIN_ERROR', 'LOADING', 'CERTIFICATES_EMPTY', 'CERTIFICATES_FOUND'])

interface CryptoGeneratorContentProps {
    operationType: string
    meta: AppWidgetMeta
    /**
     * Closes the popup when the operation ends, mass signing does not need it
     */
    onClose?: () => void
    /**
     * Called when signing or encryption starts and ends. The popup uses it to block closing:
     * a running operation is left only by «Cancel», shown while an operation with an attached signature by `SignCades` runs.
     */
    onInProgressChange?: (inProgress: boolean) => void
    /**
     * Replaces signing of the current record, used by mass signing
     */
    onExecute?: (settings: CryptoSettings) => void
    /**
     * Text of the button instead of "Execute", when the button does not sign yet
     */
    executeText?: string
    /**
     * Certificates and signature type chosen before: they are selected again when the certificates are loaded
     */
    chosenSettings?: CryptoSettings
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

function CryptoGeneratorContent({
    operationType,
    meta,
    onClose,
    onInProgressChange,
    onExecute,
    executeText,
    chosenSettings
}: CryptoGeneratorContentProps) {
    const { bcName, name: widgetName } = meta
    const { t } = useTranslation()

    const cryptoGenerator = getCryptoGenerator(meta, operationType)
    const {
        documentFileIdKey,
        documentFileNameKey,
        signatureFileIdKey,
        signatureFileNameKey,
        signatureType,
        signaturePackage,
        actionName,
        encryptedFileIdKey,
        encryptedFileNameKey
    } = cryptoGenerator || {}

    const resolvedType: CryptoGeneratorTypes = resolveCryptoGeneratorType(cryptoGenerator)
    const configError = hasInvalidCryptoGeneratorType(cryptoGenerator)

    const dispatch = useDispatch()

    const { fileId, cursor, documentName, signatureFileBaseName, encryptedFileBaseName } = useAppSelector(state => {
        const cursor = state.screen.bo.bc[bcName].cursor
        const data = state.data[bcName].find(i => i.id === cursor)
        return {
            fileId: data?.[documentFileIdKey!] as string | undefined,
            cursor: cursor,
            documentName: data?.[documentFileNameKey!] ? String(data[documentFileNameKey!]) : undefined,
            ...getCryptoFileBaseNames(data, cryptoGenerator ?? {})
        }
    }, shallowEqual)
    const [pluginUnavailable, setPluginUnavailable] = useState(false)

    /** Not expired certificates of the user; `undefined` while they are being read */
    const [certificates, setCertificates] = React.useState<CertificateData[] | undefined>(undefined)
    const [selectedSignCert, setSelectedSignCert] = React.useState<CertificateData | undefined>()
    const [selectedEncCert, setSelectedEncCert] = React.useState<CertificateData | undefined>()

    const [certificatesReadFailed, setCertificatesReadFailed] = useState(false)

    const [inProgress, setInProgress] = useState(false)
    /**
     * `SignCades` has no timeout (the plugin may show its PIN dialog): while an operation with it runs, including its
     * encryption, the user may stop waiting
     */
    const [cancellable, setCancellable] = useState(false)
    const attempt = useRef<AbortController | null>(null)

    useEffect(() => {
        if (configError) {
            console.error(
                `Signing is not configured: the action ${actionName} has an unknown type "${cryptoGenerator?.type}" ` +
                    `in options.cryptoGenerator of the widget. Expected: ${CRYPTO_GENERATOR_TYPES.join(', ')}`
            )
        }
    }, [actionName, configError, cryptoGenerator?.type])

    // read when the certificates are loaded: a change of the chosen settings must not read the certificates again
    const chosenSettingsRef = useRef(chosenSettings)
    chosenSettingsRef.current = chosenSettings

    useEffect(() => {
        if (certificates || configError) {
            return
        }
        let cancelled = false

        ;(async () => {
            try {
                await ensureCadesPluginInstalled()
            } catch (e) {
                console.error(e)
                !cancelled && setPluginUnavailable(true)
                return
            }

            try {
                const certs = await getCertificates()
                if (cancelled) {
                    return
                }
                // the list is read again with new objects, the chosen certificates are found by their thumbprints
                const chosen = chosenSettingsRef.current
                const findChosen = (cert?: CertificateData) => certs.find(item => item.thumbprint === cert?.thumbprint)
                chosen?.signCert && setSelectedSignCert(findChosen(chosen.signCert))
                chosen?.encCert && setSelectedEncCert(findChosen(chosen.encCert))
                setCertificates(certs)
            } catch (e) {
                console.error(e)
                !cancelled && setCertificatesReadFailed(true)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [certificates, configError, dispatch])

    const updatePendingData = React.useCallback(
        (data: CryptoFile, pickMap: Record<string, keyof CryptoFile>) => {
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
        async (settings: CryptoSettings) => {
            const { generatorType, signaturePackage: currentSignaturePackage } = settings

            if (!settings.signCert && hasSignatureInGeneratorType(generatorType)) {
                return
            }

            if (!settings.encCert && hasEncryptInGeneratorType(generatorType)) {
                return
            }

            setInProgress(true)
            onInProgressChange?.(true)
            const controller = new AbortController()
            attempt.current = controller

            try {
                if (!fileId) {
                    throw new Error('The record has no document file to sign or encrypt')
                }
                const response = await CxBoxApiInstance.getFile(fileId)
                const baseNames = { signatureFileBaseName, encryptedFileBaseName }

                // only the plugin phase: a stop during the upload would leave the record half-updated
                setCancellable(hasSignatureInGeneratorType(generatorType) && isNativeAttached(currentSignaturePackage))
                const cryptoData = await createCryptoData(response.data, settings, {
                    documentName: getSignedDocumentName(generatorType, documentName, baseNames),
                    signal: controller.signal
                }).finally(() => setCancellable(false))
                // after the plugin answered there is nothing to stop: a click on «Cancel» before it is hidden does nothing
                attempt.current = null

                if (!cryptoData.signature && !cryptoData.encrypted) {
                    return
                }

                dispatch(actions.uploadFile(null))

                const { signature, encrypted } = await uploadCryptoData(
                    cryptoData,
                    generatorType,
                    { signatureFileIdKey, signatureFileNameKey, encryptedFileIdKey, encryptedFileNameKey },
                    baseNames
                )

                if (signature) {
                    updatePendingData(signature, { [signatureFileIdKey!]: 'id', [signatureFileNameKey!]: 'name' })
                }
                if (encrypted) {
                    updatePendingData(encrypted, { [encryptedFileIdKey!]: 'id', [encryptedFileNameKey!]: 'name' })
                }

                dispatch(actions.uploadFileDone(null))
                dispatch(actions.sendOperation({ bcName, widgetName, operationType: actionName as string }))
            } catch (err) {
                dispatch(actions.uploadFileFailed(null))

                console.error(err)
                if (isCadesPluginError(err)) {
                    const { type, key, hintKey, params, pluginMessage, duration } = cryptoProNotification(err, {
                        signCert: settings.signCert,
                        encCert: settings.encCert
                    })
                    openNotification({
                        type,
                        message: t(key, params),
                        description: (hintKey || pluginMessage) && (
                            <>
                                {hintKey && <div>{t(hintKey, params)}</div>}
                                {pluginMessage && <Typography.Text type="secondary">{pluginMessage}</Typography.Text>}
                            </>
                        ),
                        duration
                    })
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
                attempt.current = null
                setInProgress(false)
                onInProgressChange?.(false)
                onClose?.()
            }
        },
        [
            onClose,
            onInProgressChange,
            fileId,
            dispatch,
            signatureFileIdKey,
            encryptedFileIdKey,
            bcName,
            widgetName,
            actionName,
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
        signaturePackage && signaturePackage !== 'any' ? signaturePackage : chosenSettings?.signaturePackage ?? DEFAULT_SIGNATURE_PACKAGE
    )

    const handleExecute = async () => {
        const settings: CryptoSettings = {
            generatorType: resolvedType,
            signaturePackage: currentPackage,
            signatureType,
            signCert: selectedSignCert,
            encCert: selectedEncCert
        }

        if (onExecute) {
            onExecute(settings)
        } else {
            await executeCryptoAction(settings)
        }
    }

    const currentState = useMemo(() => {
        if (configError) {
            return SIGN_CONTENT_STATES.CONFIG_ERROR
        }
        if (pluginUnavailable) {
            return SIGN_CONTENT_STATES.PLUGIN_ERROR
        }
        if (!certificates) {
            // also after a read failure, as before: the popup tells about it
            return SIGN_CONTENT_STATES.LOADING
        }
        return certificates.length ? SIGN_CONTENT_STATES.CERTIFICATES_FOUND : SIGN_CONTENT_STATES.CERTIFICATES_EMPTY
    }, [certificates, configError, pluginUnavailable])

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
                <Case value={SIGN_CONTENT_STATES.CONFIG_ERROR}>
                    <Typography className={styles.typography}>{t('Operation is not configured. Contact your administrator.')}</Typography>
                </Case>

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
                        <Form className={styles.certificates}>
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

                        <div className={styles.actions}>
                            <Button
                                onClick={handleExecute}
                                loading={inProgress}
                                disabled={
                                    (hasSignatureInGeneratorType(resolvedType) && !selectedSignCert) ||
                                    (hasEncryptInGeneratorType(resolvedType) && !selectedEncCert)
                                }
                            >
                                {executeText ?? t('Execute')}
                            </Button>
                            {cancellable && (
                                <Button type="formOperation" onClick={() => attempt.current?.abort()}>
                                    {t('Cancel')}
                                </Button>
                            )}
                        </div>
                    </FieldBaseThemeWrapper>
                </Case>
            </Switch>

            <CertErrorPopup hasError={certificatesReadFailed} onClose={() => setCertificatesReadFailed(false)} />
        </>
    )
}

export default React.memo(CryptoGeneratorContent)
