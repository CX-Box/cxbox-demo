import { WidgetComponentType } from '@features/Widget'
import CardCarouselListComponent from '@widgets/CardCarouselList/CardCarouselListComponent'
import Card from '@components/Card/Card'
import WidgetLoader from '@components/WidgetLoader'

const CardCarouselList: WidgetComponentType = ({ widgetMeta, mode }) => {
    return (
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <Card widgetMeta={widgetMeta} mode={mode}>
                <CardCarouselListComponent widgetMeta={widgetMeta} type={'carousel'} />
            </Card>
        </WidgetLoader>
    )
}

export default CardCarouselList
