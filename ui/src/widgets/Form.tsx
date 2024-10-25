import React, { useEffect } from 'react'
import { WidgetAnyProps } from '@components/Widget'
import { useData, useFormWidgetMeta } from '../hooks/queries'
import { useRowMeta } from '@hooks/queries/useRowMeta'
import { useScreenBcPath } from '@hooks/useScreenBcPath'
import { initializeForm, useBcFormField } from '@hooks/useBcForm'
import { Button, Form as AntForm } from 'antd'
import { Field } from '@components/Field'
import { isWidgetFieldBlock } from '@cxbox-ui/core'

export const Form: React.FC<WidgetAnyProps> = ({ widgetName, bcName }) => {
    const { data: widgetMeta } = useFormWidgetMeta(widgetName)
    const { cursor, thisBcPath } = useScreenBcPath(bcName)
    const { data, isSuccess } = useData(bcName, cursor)
    const { data: rowMeta } = useRowMeta(bcName)

    const bcPath = thisBcPath && cursor && [thisBcPath, cursor].join('/')

    useEffect(() => {
        if (bcPath && isSuccess && data?.data?.[0]) {
            initializeForm({ bcPath, defaultValues: data?.data[0] })
        }
    }, [bcPath, data?.data, isSuccess, thisBcPath])

    return (
        <div>
            <h1>{widgetMeta?.title}</h1>
            <AntForm>
                {widgetMeta?.fields.map(field =>
                    isWidgetFieldBlock(field) ? (
                        'block here'
                    ) : (
                        <AntForm.Item label={field.label} key={field.key}>
                            <Field bcPath={bcPath ?? ''} type={field.type} name={field.key} />
                        </AntForm.Item>
                    )
                )}
            </AntForm>
            <div>
                {rowMeta?.actions.map(action => (
                    <Button key={action.type}>{action.text}</Button>
                ))}
            </div>
        </div>
    )
}
