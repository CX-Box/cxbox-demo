import React from 'react'
import { Col, Row } from 'antd'
import { CertificateData, CertificatePurpose, getCertificateProblem } from '@features/cryptoPro'
import { cryptoProErrorMessage } from '@components/CryptoGeneratorContent/cryptoProErrorMessage'
import moment from 'moment'
import { DateFormat } from '@interfaces/date'
import FieldBaseThemeWrapper from '@components/FieldBaseThemeWrapper/FieldBaseThemeWrapper'
import styles from './CertificateInfo.module.less'
import { useTranslation } from 'react-i18next'

type Field = {
    title: string
    key?: string
    render?: (value: unknown, cert: CertificateData, purpose: CertificatePurpose) => React.ReactNode
}

const renderDate = (value: unknown) => {
    if (!value) {
        return null
    }

    const date = moment(value)

    return <span>{date.isValid() ? date.format(DateFormat.outputDateTimeWithSecondsFormat) : null}</span>
}

const fields: Field[] = [
    { title: 'Name', key: 'name' },
    { title: 'Email', key: 'email' },
    {
        title: 'Issued',
        key: 'from',
        render: renderDate
    },
    { title: 'Valid until', key: 'to', render: renderDate },
    { title: 'Provider', key: 'provider' },
    { title: 'Crypto provider', key: 'cryptoProvider' },
    { title: 'Private key link', key: 'privateKeyLink' },
    { title: 'Key algorithm', key: 'algorithmFriendlyName' },
    { title: 'Provider email', key: 'providerEmail' },
    {
        title: 'Status',
        key: 'status',
        render: (_, dataItem: CertificateData, purpose) => <CertificateStatus cert={dataItem} purpose={purpose} />
    }
]

const CertificateStatus = ({ cert, purpose }: { cert: CertificateData; purpose: CertificatePurpose }) => {
    const { t } = useTranslation()
    const problem = getCertificateProblem(cert, { purpose })
    if (!problem) {
        return <>{t('Valid')}</>
    }
    const { key, params } = cryptoProErrorMessage(problem, cert)
    return <>{t(key, params)}</>
}

interface CertificateInfoProps {
    data: CertificateData | undefined
    /** `encrypt` for an encryption recipient: only the public key is needed @defaultValue `sign` */
    purpose?: CertificatePurpose
}

const CertificateInfo = ({ data, purpose = 'sign' }: CertificateInfoProps) => {
    const { t } = useTranslation()

    if (!data) {
        return null
    }

    const getContent = (field: Field) => {
        return field.render
            ? field.render(data[field.key as keyof CertificateData], data, purpose)
            : field.key
            ? data[field.key as keyof CertificateData]
            : ''
    }

    return (
        <FieldBaseThemeWrapper className={styles.container}>
            {fields.map((field, idx) => (
                <Row key={`cert-info-${idx}`} gutter={[8, 18]}>
                    <Col span={12} className={styles.rowLabel}>
                        {t(field.title)}:
                    </Col>
                    <Col span={12} className={styles.content}>
                        {getContent(field)}
                    </Col>
                </Row>
            ))}
        </FieldBaseThemeWrapper>
    )
}

export default CertificateInfo
