import React from 'react'
import { AppWidgetMeta } from '@interfaces/widget'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import EmptyCard from '@components/EmptyCard/EmptyCard'

interface HeaderProps {
    meta: AppWidgetMeta
}

function HeaderWidget({ meta }: HeaderProps) {
    const { title, name, options } = meta

    return (
        <EmptyCard meta={meta}>
            <WidgetTitle level={1} widgetName={name} text={title} bcColor={options?.title?.bgColor} />
        </EmptyCard>
    )
}

export default React.memo(HeaderWidget)
