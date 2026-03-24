import { BaseWidgetProps } from '@features/Widget'
import LevelMenu from '@components/LevelMenu/LevelMenu'
import EmptyCard from '@components/EmptyCard/EmptyCard'
import WidgetLoader from '@components/WidgetLoader'

const SecondLevelMenu: React.FC<BaseWidgetProps> = ({ widgetMeta }) => {
    return (
        <WidgetLoader widgetMeta={widgetMeta}>
            <EmptyCard meta={widgetMeta}>
                <LevelMenu meta={widgetMeta} />
            </EmptyCard>
        </WidgetLoader>
    )
}

export default SecondLevelMenu
