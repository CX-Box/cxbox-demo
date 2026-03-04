import { BaseWidgetProps } from '@features/Widget'
import Chart from '@components/Chart/Chart'
import { Pie1DWidgetMeta } from '@interfaces/widget'
import DashboardCard from '@components/DashboardCard/DashboardCard'

function assertIsPie1DMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is Pie1DWidgetMeta {
    if (meta.type !== 'Pie1D') {
        throw new Error('Not a Pie1D meta')
    }
}

const Pie1D: React.FC<BaseWidgetProps> = ({ widgetMeta }) => {
    assertIsPie1DMeta(widgetMeta)
    return (
        <DashboardCard meta={widgetMeta}>
            <Chart meta={widgetMeta} />
        </DashboardCard>
    )
}

export default Pie1D
