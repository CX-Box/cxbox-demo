import React from 'react'
import { Form, Row, Col } from 'antd'
import Field from '../../Field/Field'
import styles from './FormWidget.less'
import cn from 'classnames'
import { useBcProps, usePendingProps, useRowMetaProps } from '@imports/teslerCore'
import { useFlatFormFields, WidgetFormMeta, WidgetFormField } from '@tesler-ui/core'
import { FieldType } from '@tesler-ui/core'
import { TemplatedTitle } from '@teslerComponents'

interface FormWidgetProps {
    meta: WidgetFormMeta
}

/**
 *
 * @param props
 * @category Widgets
 */
export const FormWidget = ({ meta }: FormWidgetProps) => {
    const hiddenKeys: string[] = []
    const { bcName, name } = meta
    const { cursor } = useBcProps({ bcName })
    const { rowMetaFields: fields, rowMetaErrors: metaErrors } = useRowMetaProps({ bcName, includeSelf: true })
    const { currentPendingValidationFails: missingFields } = usePendingProps({ bcName })

    const flattenWidgetFields = useFlatFormFields<WidgetFormField>(meta.fields).filter(item => {
        const isHidden = item.type === FieldType.hidden || item.hidden
        if (isHidden) {
            hiddenKeys.push(item.key)
        }
        return !isHidden
    })

    const memoizedFields = React.useMemo(() => {
        return (
            <Row gutter={24}>
                {meta.options?.layout?.rows.map((row, index) => {
                    return (
                        <Row key={index}>
                            {row.cols
                                .filter(field => {
                                    const fieldMeta = fields?.find(item => item.key === field.fieldKey)
                                    return fieldMeta ? !fieldMeta.hidden : true
                                })
                                .filter(col => !hiddenKeys.includes(col.fieldKey))
                                .map((col, colIndex) => {
                                    const field = flattenWidgetFields.find(item => item.key === col.fieldKey)
                                    const disabled = fields?.find(item => item.key === field.key && item.disabled)
                                    const error = (!disabled && missingFields?.[field.key]) || metaErrors?.[field.key]
                                    return (
                                        <Col
                                            key={colIndex}
                                            span={col.span}
                                            className={cn({ [styles.colWrapper]: row.cols.length > 1 || col.span !== 24 })}
                                        >
                                            <Form.Item
                                                label={
                                                    field.type === 'checkbox' ? null : (
                                                        <TemplatedTitle widgetName={meta.name} title={field.label} />
                                                    )
                                                }
                                                validateStatus={error ? 'error' : undefined}
                                                help={error}
                                            >
                                                <Field
                                                    bcName={bcName}
                                                    cursor={cursor}
                                                    widgetName={name}
                                                    widgetField={field}
                                                    disableHoverError={meta.options?.disableHoverError}
                                                />
                                            </Form.Item>
                                        </Col>
                                    )
                                })}
                        </Row>
                    )
                })}
            </Row>
        )
    }, [bcName, name, cursor, flattenWidgetFields, missingFields, metaErrors, hiddenKeys, fields, meta])

    return (
        <Form colon={false} layout="vertical">
            {memoizedFields}
        </Form>
    )
}

/**
 * @category Widgets
 */
export default React.memo(FormWidget)
