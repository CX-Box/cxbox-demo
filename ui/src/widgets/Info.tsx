import React from 'react'
import { WidgetAnyProps } from '@components/Widget'
import { useData } from '@hooks/queries/useData'
import { Card } from 'antd'
import { useBcLocation } from '@hooks/useBcLocation'
import { useInfoWidgetMeta } from '../hooks/queries'

export const Info: React.FC<WidgetAnyProps> = ({ bcName, widgetName }) => {
    const [{ bcMap }] = useBcLocation()
    const { data: widgetMeta } = useInfoWidgetMeta(widgetName)
    const { data } = useData(bcName, bcMap.get(bcName))

    return widgetMeta?.fields.map(field => (
        <Card title={field.label} key={field.key}>
            <p>{data?.data[0][field.key]}</p>
        </Card>
    ))
}
