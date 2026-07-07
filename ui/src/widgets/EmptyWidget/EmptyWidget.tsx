import { WidgetComponentType } from '@features/Widget'
import WidgetLoader from '@components/WidgetLoader'
import Card from '@components/Card/Card'

const EmptyWidget: WidgetComponentType = props => {
    return (
        <Card widgetMeta={props.widgetMeta} mode={props.mode}>
            <WidgetLoader widgetMeta={props.widgetMeta}>{null}</WidgetLoader>
        </Card>
    )
}

export default EmptyWidget
