import React from 'react'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { WidgetComponentType } from '@features/Widget'
import EmptyCard from '@components/EmptyCard/EmptyCard'

const HeaderWidget: WidgetComponentType = ({ widgetMeta }) => {
    const { title, name, options } = widgetMeta

    return (
        <EmptyCard meta={widgetMeta}>
            <WidgetTitle level={1} widgetName={name} text={title} bcColor={options?.title?.bgColor} />
        </EmptyCard>
    )
}

export default React.memo(HeaderWidget)
