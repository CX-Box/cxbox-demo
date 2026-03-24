import React from 'react'
import CardCarouselList from '@widgets/CardCarouselList/CardCarouselListComponent'
import { WidgetComponentType } from '@features/Widget'
import Card from '@components/Card/Card'
import WidgetLoader from '@components/WidgetLoader'

const CardList: WidgetComponentType = ({ widgetMeta }) => {
    return (
        <WidgetLoader widgetMeta={widgetMeta}>
            <Card meta={widgetMeta}>
                <CardCarouselList widgetMeta={widgetMeta} type="list" />
            </Card>
        </WidgetLoader>
    )
}

export default React.memo(CardList)
