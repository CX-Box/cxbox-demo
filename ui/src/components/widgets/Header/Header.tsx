import React from 'react'
import { AppWidgetMeta } from '@interfaces/widget'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'

interface HeaderProps {
    meta: AppWidgetMeta
}

function Header({ meta }: HeaderProps) {
    const { title, name, options } = meta

    return <WidgetTitle level={1} widgetName={name} text={title} bcColor={options?.title?.bgColor} />
}

export default React.memo(Header)
