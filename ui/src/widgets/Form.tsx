import React from 'react'
import { WidgetAnyProps } from '@components/Widget'
import { useData } from '../queries/useData'
import { useWidgetMeta } from '../queries'
import { Form as AntForm, Input } from 'antd'
import { FieldType } from '@cxbox-ui/schema'
import { useBcLocation } from '@hooks/useBcLocation'

export const Form: React.FC<WidgetAnyProps> = ({ widgetName, bcName }) => {
    const { data: widgetMeta } = useWidgetMeta(widgetName)
    const [{ bcMap }] = useBcLocation()
    const { data } = useData(bcName, bcMap.get(bcName))

    return (
        <AntForm initialValues={data?.data}>
            <p>dis is form</p>
            {widgetMeta?.fields.map(field => (
                <AntForm.Item<FieldType> label={field.title} name={field.key}>
                    <Input />
                </AntForm.Item>
            ))}
        </AntForm>
    )
}
