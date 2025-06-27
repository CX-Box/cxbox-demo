import React, { FunctionComponent, useMemo } from 'react'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Form as AntdForm, Row, Col } from 'antd'
import Field from '@cxboxComponents/Field/Field'
import TemplatedTitle from '@components/TemplatedTitle/TemplatedTitle'
import { useFlatFormFields } from '@hooks/useFlatFormFields'
import { buildBcUrl } from '@utils/buildBcUrl'
import { RootState } from '@store'
import { FieldType, PendingValidationFails, PendingValidationFailsFormat, WidgetFormMeta } from '@cxbox-ui/core'
import styles from './Form.less'
import { RowMetaField } from '@interfaces/rowMeta'
import { WidgetField } from '@interfaces/widget'

interface FormOwnProps {
    meta: Omit<WidgetFormMeta, 'type'>
}

interface FormProps extends FormOwnProps {
    cursor: string
    fields?: RowMetaField[]
    metaErrors?: Record<string, string>
    missingFields?: Record<string, string>
}

/**
 *
 * @param props
 * @category Widgets
 */
export const Form: FunctionComponent<FormProps> = ({ meta, fields, missingFields, metaErrors, cursor }) => {
    const { t } = useTranslation()

    const allFlattenWidgetFields = useFlatFormFields(meta.fields)

    const { hiddenKeys, flattenWidgetFields } = useMemo(() => {
        const hiddenKeys: string[] = []
        const flattenWidgetFields: typeof allFlattenWidgetFields = []

        allFlattenWidgetFields.forEach(item => {
            if (item.type === FieldType.hidden || item.hidden) {
                hiddenKeys.push(item.key)
            } else {
                flattenWidgetFields.push(item)
            }
        })

        return { hiddenKeys, flattenWidgetFields }
    }, [allFlattenWidgetFields])

    const { bcName, name } = meta

    const memoizedFields = React.useMemo(() => {
        return (
            <Row>
                {meta.options?.layout?.rows.map((row, index) => {
                    return (
                        <Row gutter={24} key={index} type="flex" align="stretch">
                            {row.cols
                                .filter(field => {
                                    const fieldMeta = fields?.find(item => item.key === field?.fieldKey)
                                    return fieldMeta ? !fieldMeta.hidden : true
                                })
                                .filter(col => !hiddenKeys.includes(col.fieldKey))
                                .map((col, colIndex) => {
                                    const field = flattenWidgetFields.find(item => item.key === col.fieldKey)
                                    const disabled = fields?.find(item => item.key === field?.key && item.disabled)
                                    const error = (!disabled && missingFields?.[field?.key as string]) || metaErrors?.[field?.key as string]
                                    return (
                                        <Col key={colIndex} span={col.span}>
                                            <AntdForm.Item
                                                className={styles.formItem}
                                                data-test="FIELD"
                                                data-test-field-type={field?.type}
                                                data-test-field-title={field?.label || field?.title}
                                                data-test-field-key={field?.key}
                                                label={<TemplatedTitle widgetName={meta.name} title={field?.label as string} />}
                                                validateStatus={error ? 'error' : undefined}
                                                help={error ? <div data-test-error-text={true}>{t(error)}</div> : undefined}
                                            >
                                                <Field
                                                    bcName={bcName}
                                                    cursor={cursor}
                                                    widgetName={name}
                                                    widgetFieldMeta={field as WidgetField}
                                                    disableHoverError={true}
                                                />
                                            </AntdForm.Item>
                                        </Col>
                                    )
                                })}
                        </Row>
                    )
                })}
            </Row>
        )
    }, [bcName, name, cursor, flattenWidgetFields, missingFields, metaErrors, hiddenKeys, fields, meta, t])

    return (
        <div className={styles.formContainer}>
            <AntdForm colon={false} layout="vertical">
                {memoizedFields}
            </AntdForm>
        </div>
    )
}

function mapStateToProps(state: RootState, ownProps: FormOwnProps) {
    const bcName = ownProps.meta.bcName
    const bc = bcName ? state.screen.bo.bc[bcName] : undefined
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = bcUrl ? state.view.rowMeta[bcName]?.[bcUrl] : undefined
    const fields = rowMeta?.fields
    const metaErrors = rowMeta?.errors
    const cursor = bc?.cursor as string
    const missingFields =
        state.view.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            ? (state.view.pendingValidationFails as PendingValidationFails)?.[bcName]?.[cursor]
            : (state.view.pendingValidationFails as Record<string, string>)
    return {
        cursor,
        fields,
        metaErrors,
        missingFields
    }
}

export default connect(mapStateToProps)(Form)
