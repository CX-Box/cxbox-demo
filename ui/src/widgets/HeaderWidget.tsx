import { WidgetAnyProps } from '@components/Widget'
import React from 'react'
import { useBcMeta, useWidgetMeta } from '../queries'

interface HeaderWidgetProps extends WidgetAnyProps {}

export const HeaderWidget: React.FC<HeaderWidgetProps> = props => {
    const { data: widgetMeta } = useWidgetMeta(props.widgetName)

    return (
        <div>
            <h1>Header widget</h1>
            {widgetMeta?.title}
        </div>
    )
}
