import { BaseWidgetProps } from '@features/Widget'
import LevelMenu from '@components/LevelMenu/LevelMenu'
import EmptyCard from '@components/EmptyCard/EmptyCard'
import WidgetLoader from '@components/WidgetLoader'

const SecondLevelMenu: React.FC<BaseWidgetProps> = ({ widgetMeta, mode }) => {
    return (
        <EmptyCard widgetMeta={widgetMeta} mode={mode}>
            <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
                <LevelMenu meta={widgetMeta} />
            </WidgetLoader>
        </EmptyCard>
    )
}

export default SecondLevelMenu
