import { WidgetComponentType } from '@features/Widget'
import LevelMenu from '@components/LevelMenu/LevelMenu'
import EmptyCard from '@components/EmptyCard/EmptyCard'
import WidgetLoader from '@components/WidgetLoader'

const FourthLevelMenu: WidgetComponentType = ({ widgetMeta, mode }) => {
    return (
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <EmptyCard widgetMeta={widgetMeta} mode={mode}>
                <LevelMenu meta={widgetMeta} />
            </EmptyCard>
        </WidgetLoader>
    )
}

export default FourthLevelMenu
