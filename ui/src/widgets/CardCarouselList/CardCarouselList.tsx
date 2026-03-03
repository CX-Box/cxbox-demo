import { WidgetComponentType } from '@features/Widget'
import CardCarouselListComponent from '@widgets/CardCarouselList/CardCarouselListComponent'
import Card from '@components/Card/Card'

const CardCarouselList: WidgetComponentType = ({ widgetMeta }) => {
    return (
        <Card meta={widgetMeta}>
            <CardCarouselListComponent widgetMeta={widgetMeta} type={'carousel'} />
        </Card>
    )
}

export default CardCarouselList
