import { WidgetComponentType } from '@features/Widget'
import LevelMenu from '@components/LevelMenu/LevelMenu'
import EmptyCard from '@components/EmptyCard/EmptyCard'

const FourthLevelMenu: WidgetComponentType = ({ widgetMeta }) => {
    return (
        <EmptyCard meta={widgetMeta}>
            <LevelMenu meta={widgetMeta} />
        </EmptyCard>
    )
}

export default FourthLevelMenu
