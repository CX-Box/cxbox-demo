import React from 'react'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { WidgetComponentType } from '@features/Widget'
import EmptyCard from '@components/EmptyCard/EmptyCard'
import WidgetLoader from '@components/WidgetLoader'

const HeaderWidget: WidgetComponentType = ({ widgetMeta }) => {
    const { title, name, options } = widgetMeta

    return (
        <WidgetLoader widgetMeta={widgetMeta}>
            <EmptyCard meta={widgetMeta}>
                <WidgetTitle level={1} widgetName={name} text={title} bcColor={options?.title?.bgColor} />
            </EmptyCard>
        </WidgetLoader>
    )
}

export default React.memo(HeaderWidget)
