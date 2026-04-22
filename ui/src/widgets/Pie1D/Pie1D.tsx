import { BaseWidgetProps } from '@features/Widget'
import Chart from '@components/Chart/Chart'
import { Pie1DWidgetMeta } from '@interfaces/widget'
import DashboardCard from '@components/DashboardCard/DashboardCard'
import WidgetLoader from '@components/WidgetLoader'

function assertIsPie1DMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is Pie1DWidgetMeta {
    if (meta.type !== 'Pie1D') {
        throw new Error('Not a Pie1D meta')
    }
}

const Pie1D: React.FC<BaseWidgetProps> = ({ widgetMeta, mode }) => {
    assertIsPie1DMeta(widgetMeta)
    return (
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <DashboardCard widgetMeta={widgetMeta} mode={mode}>
                <Chart meta={widgetMeta} />
            </DashboardCard>
        </WidgetLoader>
    )
}

export default Pie1D
