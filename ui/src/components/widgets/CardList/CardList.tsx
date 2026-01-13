import React from 'react'
import { AppWidgetMeta } from '@interfaces/widget'
import CardCarouselList from '@components/widgets/CardCarouselList/CardCarouselList'

interface CardListProps {
    meta: AppWidgetMeta
}

function CardList({ meta }: CardListProps) {
    return <CardCarouselList meta={meta} type="list" />
}

export default React.memo(CardList)
