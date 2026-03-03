import React from 'react'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Form as AntdForm, Row, Col } from 'antd'
import Field from '@features/Field/Field'
import TemplatedTitle from '@components/TemplatedTitle/TemplatedTitle'
import { useProportionalWidgetGrid } from '@hooks/widgetGrid'
import { buildBcUrl } from '@utils/buildBcUrl'
import { RootState } from '@store'
import { PendingValidationFails, PendingValidationFailsFormat, WidgetFormMeta } from '@cxbox-ui/core'
import { RowMetaField } from '@interfaces/rowMeta'
import { WidgetField } from '@interfaces/widget'
import styles from './Form.less'
import FieldBaseThemeWrapper from '@components/FieldBaseThemeWrapper/FieldBaseThemeWrapper'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import Card from '@components/Card/Card'

function assertIsFormMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is WidgetFormMeta {
    if (meta.type !== 'Form' && meta.type !== 'FormPopup') {
        throw new Error('Not a Form meta')
    }
}

interface FormProps extends BaseWidgetProps {
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
const Form: WidgetComponentType<FormProps> = ({ widgetMeta, fields, missingFields, metaErrors, cursor }) => {
    assertIsFormMeta(widgetMeta)
    const { t } = useTranslation()
    const { bcName, name } = widgetMeta
    const { empty, grid, visibleFlattenWidgetFields } = useProportionalWidgetGrid(widgetMeta)

    const memoizedFields = React.useMemo(() => {
        return (
            <Row>
                {grid?.map((row, index) => {
                    return (
                        <React.Fragment key={index}>
                            <Row gutter={24} type="flex" className={styles.nowrap}>
                                {row.cols.map((col, colIndex) => {
                                    const field = visibleFlattenWidgetFields.find(item => item.key === col.fieldKey)

                                    return (
                                        <Col key={colIndex} span={col.span}>
                                            <div className={styles.formLabel}>
                                                <TemplatedTitle widgetName={widgetMeta.name} title={field?.label as string} />
                                            </div>
                                        </Col>
                                    )
                                })}
                            </Row>
                            <Row gutter={24} type="flex" className={styles.nowrap}>
                                {row.cols.map((col, colIndex) => {
                                    const field = visibleFlattenWidgetFields.find(item => item.key === col.fieldKey)
                                    const error = missingFields?.[field?.key as string] || metaErrors?.[field?.key as string]

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
                        </React.Fragment>
                    )
                })}
            </Row>
        )
    }, [grid, visibleFlattenWidgetFields, missingFields, metaErrors, widgetMeta.name, t, bcName, cursor, name])

    return (
        <Card meta={widgetMeta}>
            {empty ? null : (
                <FieldBaseThemeWrapper className={styles.formContainer}>
                    <AntdForm colon={false} layout="vertical">
                        {memoizedFields}
                    </AntdForm>
                </FieldBaseThemeWrapper>
            )}
        </Card>
    )
}

function mapStateToProps(state: RootState, ownProps: BaseWidgetProps) {
    const bcName = ownProps.widgetMeta.bcName
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
