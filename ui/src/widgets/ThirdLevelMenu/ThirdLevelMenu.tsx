import { BaseWidgetProps } from '@features/Widget'
import LevelMenu from '@components/LevelMenu/LevelMenu'
import EmptyCard from '@components/EmptyCard/EmptyCard'

const ThirdLevelMenu: React.FC<BaseWidgetProps> = ({ widgetMeta }) => {
    return (
        <EmptyCard meta={widgetMeta}>
            <LevelMenu meta={widgetMeta} />
        </EmptyCard>
    )
}

export default ThirdLevelMenu
