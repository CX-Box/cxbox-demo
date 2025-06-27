import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Form as AntdForm, Row, Col } from 'antd'
import Field from '@components/Field/Field'
import TemplatedTitle from '@components/TemplatedTitle/TemplatedTitle'
import { buildBcUrl } from '@utils/buildBcUrl'
import { RootState } from '@store'
import { PendingValidationFails, PendingValidationFailsFormat, WidgetFormMeta } from '@cxbox-ui/core'
import styles from './Form.less'
import { RowMetaField } from '@interfaces/rowMeta'
import { WidgetField } from '@interfaces/widget'
import { useProportionalWidgetGrid } from '@hooks/widgetGrid'

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
    const { bcName, name } = meta
    const { grid, visibleFlattenWidgetFields } = useProportionalWidgetGrid(meta)

    const memoizedFields = React.useMemo(() => {
        return (
            <Row>
                {grid?.map((row, index) => {
                    return (
                        <>
                            <Row gutter={24} key={index} type="flex" className={styles.nowrap}>
                                {row.cols.map((col, colIndex) => {
                                    const field = visibleFlattenWidgetFields.find(item => item.key === col.fieldKey)

                                    return (
                                        <Col key={colIndex} span={col.span}>
                                            <div className={styles.formLabel}>
                                                <TemplatedTitle widgetName={meta.name} title={field?.label as string} />
                                            </div>
                                        </Col>
                                    )
                                })}
                            </Row>
                            <Row gutter={24} key={index} type="flex" className={styles.nowrap}>
                                {row.cols.map((col, colIndex) => {
                                    const field = visibleFlattenWidgetFields.find(item => item.key === col.fieldKey)
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
                        </>
                    )
                })}
            </Row>
        )
    }, [grid, visibleFlattenWidgetFields, fields, missingFields, metaErrors, meta.name, t, bcName, cursor, name])

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
