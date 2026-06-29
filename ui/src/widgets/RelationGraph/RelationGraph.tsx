import { BaseWidgetProps } from '@features/Widget'
import Chart from '@components/Chart/Chart'
import { RelationGraphWidgetMeta } from '@interfaces/widget'
import DashboardCard from '@components/DashboardCard/DashboardCard'
import WidgetLoader from '@components/WidgetLoader'

function assertIsRelationGraph(meta: BaseWidgetProps['widgetMeta']): asserts meta is RelationGraphWidgetMeta {
    if (meta.type !== 'RelationGraph') {
        throw new Error('Not a RelationGraph meta')
    }
}

const RelationGraph: React.FC<BaseWidgetProps> = ({ widgetMeta, mode }) => {
    assertIsRelationGraph(widgetMeta)
    return (
        <DashboardCard widgetMeta={widgetMeta} mode={mode}>
            <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
                <Chart meta={widgetMeta} />
            </WidgetLoader>
        </DashboardCard>
    )
}

export default RelationGraph
