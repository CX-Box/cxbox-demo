import React from 'react'
import CardCarouselList from '@widgets/CardCarouselList/CardCarouselListComponent'
import { WidgetComponentType } from '@features/Widget'
import Card from '@components/Card/Card'

const CardList: WidgetComponentType = ({ widgetMeta }) => {
    return (
        <Card meta={widgetMeta}>
            <CardCarouselList widgetMeta={widgetMeta} type="list" />
        </Card>
    )
}

export default React.memo(CardList)
