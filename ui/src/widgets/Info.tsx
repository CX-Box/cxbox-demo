import { FC } from 'react'
import { WidgetAnyProps } from '../components/Widget.tsx'
import { useHooks } from '../hooks/useHooks.ts'
import { Col, Row, Space, Typography } from 'antd'
import { Field } from '../components/Field.tsx'
import { isWidgetInfo } from '../core/contract/widgets'
import { isFieldBlock } from '../core/contract/fields'

export const Info: FC<WidgetAnyProps> = ({ widgetName }) => {
    const hooks = useHooks()
    const { data: widgetMeta } = hooks.useTypedWidgetMeta(isWidgetInfo, widgetName)
    const bcName = widgetMeta?.bcName || ''
    const { data } = hooks.useData(bcName)
    const { cursor } = hooks.useScreenBcPath(bcName)
    const item = data?.data?.find(item => item.id === cursor)

    return (
        <div>
            <h1>{widgetMeta?.title}</h1>
            {widgetMeta?.fields.map(field =>
                isFieldBlock(field) ? (
                    <Row gutter={16}>
                        {field.fields.map(field => (
                            <Col>
                                <Space>
                                    <Typography.Text>{field.label}</Typography.Text>
                                    <Field.Read id={item?.id || ''} type={field.type} fieldKey={field.key} widgetName={widgetName}>
                                        {item?.[field.key]}
                                    </Field.Read>
                                </Space>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Row key={field.key} gutter={16}>
                        <Col>{field.label}</Col>
                        <Col>
                            <Field.Read id={item?.id || ''} type={field.type} fieldKey={field.key} widgetName={widgetName}>
                                {item?.[field.key]}
                            </Field.Read>
                        </Col>
                    </Row>
                )
            )}
        </div>
    )
}
