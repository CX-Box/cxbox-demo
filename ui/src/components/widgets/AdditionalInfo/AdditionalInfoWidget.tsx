import React from 'react'
import { interfaces } from '@cxbox-ui/core'
import { CustomWidgetTypes } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useFlatFormFields } from '@hooks/useFlatFormFields'
import { Col, Row } from 'antd'
import { Field } from '@cxboxComponents'
import styles from './AdditionalInfoWidget.module.css'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'

type AdditionalInfoWidgetMeta = Omit<interfaces.WidgetInfoMeta, 'type'>

interface Props {
    type: CustomWidgetTypes.AdditionalInfo
    meta: AdditionalInfoWidgetMeta
}
export const AdditionalInfoWidget: React.FC<Props> = ({ meta }) => {
    const { bcName, options, fields: widgetFields } = meta
    const bcUrl = buildBcUrl(bcName, true)
    const bc = useAppSelector(state => (bcName ? state.screen.bo.bc[bcName] : undefined))
    const cursor = bc?.cursor
    const fields = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl]?.fields)

    const flattenWidgetFields = useFlatFormFields(widgetFields || [])

    return (
        <Row className={styles.widgetContainer}>
            <Row gutter={[8, 18]}>
                <Col span={24}>
                    <WidgetTitle className={styles.title} level={2} widgetName={meta.name} marginBottom={0} text={meta.title} />
                </Col>
            </Row>
            {options?.layout?.rows.map((row, rowIndex) => {
                return (
                    <Row key={rowIndex} gutter={[8, 18]}>
                        {row.cols
                            .filter(field => {
                                const fieldMeta = fields?.find(f => f.key === field.fieldKey)
                                return fieldMeta ? !fieldMeta.hidden : true
                            })
                            .map(col => {
                                const field = flattenWidgetFields.find(f => f.key === col.fieldKey)

                                return field ? (
                                    <React.Fragment key={col.fieldKey}>
                                        <Col span={12} className={styles.rowLabel}>
                                            {field.label}
                                            <span className={styles.underline} />
                                        </Col>
                                        <Col span={12}>
                                            <div
                                                data-test="FIELD"
                                                data-test-field-type={field.type}
                                                data-test-field-title={field.label || field.title}
                                                data-test-field-key={field.key}
                                            >
                                                <Field
                                                    className={styles.fieldOverride}
                                                    bcName={meta.bcName}
                                                    cursor={cursor || ''}
                                                    widgetName={meta.name}
                                                    widgetFieldMeta={field}
                                                    readonly={true}
                                                />
                                            </div>
                                        </Col>
                                    </React.Fragment>
                                ) : null
                            })}
                    </Row>
                )
            })}
        </Row>
    )
}
