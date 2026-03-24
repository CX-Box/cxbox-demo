import { WidgetComponentType } from '@features/Widget'
import LevelMenu from '@components/LevelMenu/LevelMenu'
import EmptyCard from '@components/EmptyCard/EmptyCard'
import WidgetLoader from '@components/WidgetLoader'

const FourthLevelMenu: WidgetComponentType = ({ widgetMeta }) => {
    return (
        <WidgetLoader widgetMeta={widgetMeta}>
            <EmptyCard meta={widgetMeta}>
                <LevelMenu meta={widgetMeta} />
            </EmptyCard>
        </WidgetLoader>
    )
}

export default FourthLevelMenu
