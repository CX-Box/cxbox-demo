import React from 'react'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { WidgetComponentType } from '@features/Widget'
import EmptyCard from '@components/EmptyCard/EmptyCard'
import WidgetLoader from '@components/WidgetLoader'

const HeaderWidget: WidgetComponentType = ({ widgetMeta, mode }) => {
    const { title, name, options } = widgetMeta

    return (
        <EmptyCard widgetMeta={widgetMeta} mode={mode}>
            <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
                <WidgetTitle level={1} widgetName={name} text={title} bcColor={options?.title?.bgColor} />
            </WidgetLoader>
        </EmptyCard>
    )
}

export default React.memo(HeaderWidget)
