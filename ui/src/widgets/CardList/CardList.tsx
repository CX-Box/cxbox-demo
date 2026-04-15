import React from 'react'
import CardCarouselList from '@widgets/CardCarouselList/CardCarouselListComponent'
import { WidgetComponentType } from '@features/Widget'
import Card from '@components/Card/Card'
import WidgetLoader from '@components/WidgetLoader'

const CardList: WidgetComponentType = ({ widgetMeta, mode }) => {
    return (
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <Card widgetMeta={widgetMeta} mode={mode}>
                <CardCarouselList widgetMeta={widgetMeta} type="list" />
            </Card>
        </WidgetLoader>
    )
}

export default React.memo(CardList)
