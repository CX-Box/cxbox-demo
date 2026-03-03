import React from 'react'
import CardCarouselList from '@widgets/CardCarouselList/CardCarouselList'
import { WidgetComponentType } from '@features/Widget'

const CardList: WidgetComponentType = ({ widgetMeta }) => {
    return <CardCarouselList widgetMeta={widgetMeta} type="list" />
}

export default React.memo(CardList)
