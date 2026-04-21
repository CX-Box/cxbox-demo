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
import { cryptoProLinks } from '@components/CryptoGeneratorContent/constants'
import { Lookup } from '@utils/Lookup'
import Switch from '@components/Switch/Switch'
import Case from '@components/Switch/Case'
import { ensureCadesPluginInstalled } from '@utils/cadesPlugin/ensureCadesPluginInstalled'
import CertErrorPopup from '@components/CryptoGeneratorContent/CertErrorPopup'
import { CadesPluginError } from '@utils/cadesPlugin/CadesPluginError'
import { base64ToPemBlob } from '@utils/cadesPlugin/base64ToPemBlob'
import { encryptData } from '@utils/cadesPlugin/encryptData'
import { DEFAULT_SIGNATURE_PACKAGE, SIGNATURE_PACKAGE, SignaturePackage } from '@constants/cadesPlugin'
import createVerifiedSignature from '@utils/cadesPlugin/createVerifiedSignature'
import { DataItem } from '@cxbox-ui/schema'
import FieldBaseThemeWrapper from '@components/FieldBaseThemeWrapper/FieldBaseThemeWrapper'
import Button from '@components/ui/Button/Button'
import { DateFormat } from '@interfaces/date'

const SIGN_CONTENT_STATES = Lookup.create(['PLUGIN_ERROR', 'LOADING', 'CERTIFICATES_EMPTY', 'CERTIFICATES_FOUND'])

interface CryptoGeneratorContentProps {
    operationType: string
    meta: AppWidgetMeta
    onClose: () => void
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

function CryptoGeneratorContent({ operationType, meta, onClose }: CryptoGeneratorContentProps) {
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

    const { fileId, cursor, signatureFileBaseName, encryptedFileBaseName } = useAppSelector(state => {
        const cursor = state.screen.bo.bc[bcName].cursor
        const data = state.data[bcName].find(i => i.id === cursor)
        return {
            fileId: data?.[documentFileIdKey!] as string,
            cursor: cursor,
            signatureFileBaseName: String(data?.[signatureFileBaseNameKey!] ?? data?.[documentFileNameKey!] ?? 'signature'),
            encryptedFileBaseName: String(data?.[encryptedFileBaseNameKey!] ?? data?.[documentFileNameKey!] ?? 'encrypted_file')
        }
    }, shallowEqual)
    const [cadesPluginError, setCadesPluginError] = useState(false)

    const [certList, setCertList] = React.useState<Array<CertificateData> | undefined>(undefined)
    const [certEmpty, setCertEmpty] = React.useState<boolean>(false)
    const [selectedSignCert, setSelectedSignCert] = React.useState<CertificateData | undefined>()
    const [selectedEncCert, setSelectedEncCert] = React.useState<CertificateData | undefined>()

    const [certBusinessError, setCertBusinessError] = useState(false)

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

            onClose()

            try {
                const response = await CxBoxApiInstance.getFile(fileId)
                const file = response.data

                const sign = (data: Blob | string) =>
                    createVerifiedSignature(selectedSignCert!.itself, data, {
                        cadesType: signatureType,
                        signaturePackage: currentSignaturePackage
                    })
                const encrypt = (data: Blob | string) => encryptData(selectedEncCert!.itself, data)

                const strategies: Record<CryptoGeneratorTypes, () => Promise<{ signatureBase64?: string; encryptedBase64?: string }>> = {
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

                        const dataToEncrypt = currentSignaturePackage === 'attached' ? signatureBase64 : file
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

                        return {
                            encryptedBase64,
                            signatureBase64: await sign(encryptedBase64)
                        }
                    }
                }

                const { signatureBase64, encryptedBase64 } = await strategies[generatorType]()

                if (!signatureBase64 && !encryptedBase64) {
                    return
                }

                dispatch(actions.uploadFile(null))

                const isSingleOutputFile =
                    signatureFileIdKey === encryptedFileIdKey && !!signatureFileIdKey && hasCombinedTypeInGeneratorType(generatorType)

                const uploadAndUpdate = async (
                    base64: string,
                    extension: 'sig' | 'enc',
                    baseName: string,
                    idKey: string,
                    nameKey: string
                ) => {
                    const response = await CxBoxApiInstance.uploadFile(base64ToPemBlob(base64), `${baseName}.${extension}`)
                    updatePendingData(response.data.data, { [idKey]: 'id', [nameKey]: 'name' })
                }

                if (isSingleOutputFile) {
                    if (generatorType === 'signAndEncrypt' && encryptedBase64) {
                        await uploadAndUpdate(encryptedBase64, 'enc', encryptedFileBaseName, encryptedFileIdKey!, encryptedFileNameKey!)
                    } else if (generatorType === 'encryptAndSign' && signatureBase64) {
                        await uploadAndUpdate(signatureBase64, 'sig', signatureFileBaseName, signatureFileIdKey!, signatureFileNameKey!)
                    }
                } else {
                    if (signatureBase64 && signatureFileIdKey && signatureFileNameKey) {
                        await uploadAndUpdate(signatureBase64, 'sig', signatureFileBaseName, signatureFileIdKey, signatureFileNameKey)
                    }
                    if (encryptedBase64 && encryptedFileIdKey && encryptedFileNameKey) {
                        await uploadAndUpdate(encryptedBase64, 'enc', encryptedFileBaseName, encryptedFileIdKey, encryptedFileNameKey)
                    }
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
            }
        },
        [
            selectedSignCert,
            selectedEncCert,
            onClose,
            fileId,
            dispatch,
            signatureFileIdKey,
            encryptedFileIdKey,
            bcName,
            widgetName,
            actionName,
            signatureType,
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
        await executeCryptoAction(resolvedType, currentPackage)
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
                                <a key="0" href={cryptoProLinks.cryptoproInstruction} target="_blank" rel="noreferrer">
                                    placeholder
                                </a>,
                                <br key="1" />,
                                <a key="2" href={cryptoProLinks.hdLink} target="_blank" rel="noreferrer">
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
                                <a key="0" href={cryptoProLinks.instructionLink} target="_blank" rel="noreferrer">
                                    placeholder
                                </a>,
                                <br key="1" />,
                                <a key="2" href={cryptoProLinks.hdLink} target="_blank" rel="noreferrer">
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
