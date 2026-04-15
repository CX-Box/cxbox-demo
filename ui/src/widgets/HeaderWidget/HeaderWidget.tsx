import React from 'react'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { WidgetComponentType } from '@features/Widget'
import EmptyCard from '@components/EmptyCard/EmptyCard'
import WidgetLoader from '@components/WidgetLoader'

const HeaderWidget: WidgetComponentType = ({ widgetMeta, mode }) => {
    const { title, name, options } = widgetMeta

    return (
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <EmptyCard widgetMeta={widgetMeta} mode={mode}>
                <WidgetTitle level={1} widgetName={name} text={title} bcColor={options?.title?.bgColor} />
            </EmptyCard>
        </WidgetLoader>
    )
}

export default React.memo(HeaderWidget)
