import React from 'react'
import { useFlatFormFields } from '@hooks/useFlatFormFields'
import { Col, Row } from 'antd'
import { Field } from '@cxboxComponents'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { RowMeta } from '@interfaces/rowMeta'
import { AdditionalInfoWidgetMeta } from '@interfaces/widget'
import { AdditionalInfoHeader } from '@components/widgets/AdditionalInfo/AdditionalInfoHeader'
import styles from './AdditionalInfoItem.module.css'

interface Props {
    meta: AdditionalInfoWidgetMeta
    rowMeta: RowMeta | undefined
    cursor: string | undefined | null
}

export const AdditionalInfoItem: React.FC<Props> = ({ meta, rowMeta, cursor }) => {
    const { options, fields: widgetFields } = meta

    const flattenWidgetFields = useFlatFormFields(widgetFields || [])
    const { isMainWidget, isCollapsed } = useWidgetCollapse(meta.name)

    return (
        <>
            <AdditionalInfoHeader meta={meta} id={cursor} level={2} />
            {!(isMainWidget && isCollapsed) &&
                options?.layout?.rows.map((row, rowIndex) => {
                    return (
                        <Row key={rowIndex} gutter={[8, 18]}>
                            {row.cols
                                .filter(field => {
                                    const fieldMeta = rowMeta?.fields?.find(f => f.key === field.fieldKey)
                                    return fieldMeta ? !fieldMeta.hidden : true
                                })
                                .map(col => {
                                    const field = flattenWidgetFields.find(f => f.key === col.fieldKey)

                                    return field ? (
                                        <React.Fragment key={col.fieldKey}>
                                            <Col span={12} className={styles.rowLabel}>
                                                {field.label}
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
        </>
    )
}
