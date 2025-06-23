import { FC, useEffect } from 'react'
import { WidgetAnyProps } from '../components/Widget.tsx'
import { useHooks } from '../hooks/useHooks.ts'
import { isWidgetForm } from '../core/contract/widgets'
import { Col, Row, Typography } from 'antd'
import { isField, isFieldBlock } from '../core/contract/fields'
import { Field } from '../components/Field.tsx'
import { DataItem } from '../core/contract/data.ts'

export const Form: FC<WidgetAnyProps> = props => {
    const hooks = useHooks()
    const { data: widgetMeta } = hooks.useTypedWidgetMeta(isWidgetForm, props.widgetName)
    const bcName = widgetMeta?.bcName || ''
    // const { data } = hooks.useData(bcName)
    const { cursor } = hooks.useScreenBcPath(bcName)
    const { data: rowMetaFields } = hooks.useFields(bcName)
    const initVirtualForm = hooks.useStore(state => state.initVirtualForm)

    useEffect(() => {
        if (cursor && rowMetaFields) {
            const defaultValues: DataItem = {
                id: '',
                vstamp: 0
            }
            rowMetaFields.forEach(field => {
                defaultValues[field.key] = field.currentValue ?? field.defaultValue
            })
            initVirtualForm(bcName, cursor, defaultValues)
        }
    }, [bcName, cursor, initVirtualForm, rowMetaFields])

    return (
        <div>
            <Typography.Title>{widgetMeta?.title}</Typography.Title>
            {widgetMeta?.fields?.map(field => {
                if (cursor) {
                    if (isFieldBlock(field)) {
                        return (
                            <Row key={field.blockId} gutter={16}>
                                {field.fields.map(field => (
                                    <Col>
                                        <Field.Write fieldKey={field.key} id={cursor} type={field.type} widgetName={props.widgetName} />
                                    </Col>
                                ))}
                            </Row>
                        )
                    }
                    if (isField(field)) {
                        return (
                            <Row key={field.key} gutter={16}>
                                <Field.Write fieldKey={field.key} id={cursor} type={field.type} widgetName={props.widgetName} />
                            </Row>
                        )
                    }
                }
            })}
        </div>
    )
}
