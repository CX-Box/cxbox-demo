import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { Form, notification, Select, Spin, Typography } from 'antd'
import { useAppSelector } from '@store'
import { actions } from '@actions'
import { CxBoxApiInstance } from 'api'
import { ApplicationErrorType, PendingDataItem } from '@cxbox-ui/core'
import { CertificateData } from '@interfaces/sign'
import styles from './CryptoGeneratorContent.module.less'
import { AppWidgetMeta, CryptoGeneratorItem, CryptoGeneratorTypes } from '@interfaces/widget'
import { buildBcUrl } from '@utils/buildBcUrl'
import getCertificates from '@utils/cadesPlugin/getCertificates'
import moment from 'moment'
import CertificateInfo from '@components/CryptoGeneratorContent/CertificateInfo'
import { Trans, useTranslation } from 'react-i18next'
import { filterActiveCertificates } from '@utils/cadesPlugin/filterActiveCertificates'
import { Lookup } from '@utils/Lookup'
import Switch from '@components/Switch/Switch'
import Case from '@components/Switch/Case'
import { ensureCadesPluginInstalled } from '@utils/cadesPlugin/ensureCadesPluginInstalled'
import CertErrorPopup from '@components/CryptoGeneratorContent/CertErrorPopup'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { CRYPTOPRO_LINKS, DEFAULT_SIGNATURE_PACKAGE, SIGNATURE_PACKAGE, SignaturePackage } from '@constants/cadesPlugin'
import FieldBaseThemeWrapper from '@components/FieldBaseThemeWrapper/FieldBaseThemeWrapper'
import Button from '@components/ui/Button/Button'
import { DateFormat } from '@interfaces/date'
import {
    createCryptoData,
    CryptoFile,
    CryptoSettings,
    getCryptoFileBaseNames,
    getCryptoGenerator,
    hasEncryptInGeneratorType,
    hasSignatureInGeneratorType,
    uploadCryptoData
} from '@components/CryptoGeneratorContent/cryptoFile'

const SIGN_CONTENT_STATES = Lookup.create(['PLUGIN_ERROR', 'LOADING', 'CERTIFICATES_EMPTY', 'CERTIFICATES_FOUND'])

interface CryptoGeneratorContentProps {
    operationType: string
    meta: AppWidgetMeta
    /**
     * Closes the popup when the operation ends, mass signing does not need it
     */
    onClose?: () => void
    /**
     * Called when signing or encryption starts and ends. The popup uses it to block closing.
     */
    onInProgressChange?: (inProgress: boolean) => void
    /**
     * Replaces signing of the current record, used by mass signing
     */
    onExecute?: (settings: CryptoSettings) => void
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

function CryptoGeneratorContent({ operationType, meta, onClose, onInProgressChange, onExecute }: CryptoGeneratorContentProps) {
    const { bcName, name: widgetName } = meta
    const { t } = useTranslation()

    const cryptoGenerator = getCryptoGenerator(meta, operationType)
    const {
        documentFileIdKey,
        signatureFileIdKey,
        signatureFileNameKey,
        signatureType,
        signaturePackage,
        actionName,
        encryptedFileIdKey,
        encryptedFileNameKey
    } = cryptoGenerator || {}

    const resolvedType: CryptoGeneratorTypes = resolveCryptoGeneratorType(cryptoGenerator)

    const dispatch = useDispatch()

    const { fileId, cursor, signatureFileBaseName, encryptedFileBaseName } = useAppSelector(state => {
        const cursor = state.screen.bo.bc[bcName].cursor
        const data = state.data[bcName].find(i => i.id === cursor)
        return {
            fileId: data?.[documentFileIdKey!] as string,
            cursor: cursor,
            ...getCryptoFileBaseNames(data, cryptoGenerator ?? {})
        }
    }, shallowEqual)
    const [cadesPluginError, setCadesPluginError] = useState(false)

    const [certList, setCertList] = React.useState<Array<CertificateData> | undefined>(undefined)
    const [certEmpty, setCertEmpty] = React.useState<boolean>(false)
    const [selectedSignCert, setSelectedSignCert] = React.useState<CertificateData | undefined>()
    const [selectedEncCert, setSelectedEncCert] = React.useState<CertificateData | undefined>()

    const [certBusinessError, setCertBusinessError] = useState(false)

    const [inProgress, setInProgress] = useState(false)

    useEffect(() => {
        if (certList) {
            return
        }

        ;(async () => {
            try {
                await ensureCadesPluginInstalled()
            } catch (e) {
                console.error(e)
                setCadesPluginError(true)
                return
            }

            try {
                const certs = await getCertificates()

                if (certs?.length) {
                    setCertList(certs)
                }

                setCertEmpty(!certs?.length)
            } catch (e) {
                setCertBusinessError(true)
            }
        })()
    }, [certList, dispatch])

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
            const { generatorType } = settings

            if (!settings.signCert && hasSignatureInGeneratorType(generatorType)) {
                return
            }

            if (!settings.encCert && hasEncryptInGeneratorType(generatorType)) {
                return
            }

            setInProgress(true)
            onInProgressChange?.(true)

            try {
                const response = await CxBoxApiInstance.getFile(fileId)
                const cryptoData = await createCryptoData(response.data, settings)

                if (!cryptoData.signatureBase64 && !cryptoData.encryptedBase64) {
                    return
                }

                dispatch(actions.uploadFile(null))

                const { signature, encrypted } = await uploadCryptoData(cryptoData, generatorType, cryptoGenerator ?? {}, {
                    signatureFileBaseName,
                    encryptedFileBaseName
                })

                if (signature) {
                    updatePendingData(signature, { [signatureFileIdKey!]: 'id', [signatureFileNameKey!]: 'name' })
                }
                if (encrypted) {
                    updatePendingData(encrypted, { [encryptedFileIdKey!]: 'id', [encryptedFileNameKey!]: 'name' })
                }

                dispatch(actions.uploadFileDone(null))
                dispatch(actions.sendOperation({ bcName, widgetName, operationType: actionName as string }))
            } catch (err) {
                if (err instanceof CadesPluginError && err.code === CadesPluginError.SIGNATURE_VERIFICATION_FAILED) {
                    notification.error({ message: t('Signature verification failed'), description: err, duration: 0 })
                }

                dispatch(actions.uploadFileFailed(null))
                dispatch(
                    actions.showViewError({
                        error: {
                            type: ApplicationErrorType.BusinessError,
                            message: t('The operation could not be completed', { error: getErrorMessage(err) })
                        }
                    })
                )
            } finally {
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
            cryptoGenerator,
            signatureFileIdKey,
            encryptedFileIdKey,
            bcName,
            widgetName,
            actionName,
            updatePendingData,
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

    const handleSignWithCondition = async () => {
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

    const actualCertificate = filterActiveCertificates(certList)

    const currentState = useMemo(() => {
        if (cadesPluginError) {
            return SIGN_CONTENT_STATES.PLUGIN_ERROR
        }
        if (!certList && !certEmpty) {
            return SIGN_CONTENT_STATES.LOADING
        }
        if (certEmpty || !actualCertificate.length) {
            return SIGN_CONTENT_STATES.CERTIFICATES_EMPTY
        }

        return SIGN_CONTENT_STATES.CERTIFICATES_FOUND
    }, [actualCertificate.length, cadesPluginError, certEmpty, certList])

    const createCertSelect = useCallback(
        (value: string | undefined, onChange: (value: string | undefined) => void) => {
            return (
                <Select value={value} onChange={onChange} style={{ width: '100%' }}>
                    {actualCertificate.map(i => (
                        <Select.Option key={i.publicKeyValue} value={i.publicKeyValue}>
                            {t('Certification issued', {
                                name: i.name,
                                from: moment(i.from).format(DateFormat.outputDateTimeWithSecondsFormat)
                            })}
                        </Select.Option>
                    ))}
                </Select>
            )
        },
        [actualCertificate, t]
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
                                        {createCertSelect(selectedSignCert?.publicKeyValue, value => {
                                            setSelectedSignCert(certList?.find(i => i.publicKeyValue === value))
                                        })}
                                    </Form.Item>
                                    <CertificateInfo data={selectedSignCert} />
                                </>
                            )}

                            {hasEncryptInGeneratorType(resolvedType) && (
                                <>
                                    <Form.Item label={t('Certificate for encryption')} className={styles.formItem}>
                                        {createCertSelect(selectedEncCert?.publicKeyValue, value => {
                                            setSelectedEncCert(certList?.find(i => i.publicKeyValue === value))
                                        })}
                                    </Form.Item>
                                    <CertificateInfo data={selectedEncCert} />
                                </>
                            )}
                        </Form>

                        <Button
                            onClick={handleSignWithCondition}
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

            <CertErrorPopup hasError={certBusinessError} onClose={() => setCertBusinessError(false)} />
        </>
    )
}

export default React.memo(CryptoGeneratorContent)
