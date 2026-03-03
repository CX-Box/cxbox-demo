import { BaseWidgetProps } from '@features/Widget'
import Chart from '@components/Chart/Chart'
import { RelationGraphWidgetMeta } from '@interfaces/widget'
import DashboardCard from '@components/DashboardCard/DashboardCard'

function assertIsRelationGraph(meta: BaseWidgetProps['widgetMeta']): asserts meta is RelationGraphWidgetMeta {
    if (meta.type !== 'RelationGraph') {
        throw new Error('Not a RelationGraph meta')
    }
}

const RelationGraph: React.FC<BaseWidgetProps> = ({ widgetMeta }) => {
    assertIsRelationGraph(widgetMeta)
    return (
        <DashboardCard meta={widgetMeta}>
            <Chart meta={widgetMeta} />
        </DashboardCard>
    )
}

export default RelationGraph
