import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import Chart from '@components/Chart/Chart'
import { Chart2DWidgetMeta } from '@interfaces/widget'
import DashboardCard from '@components/DashboardCard/DashboardCard'
import WidgetLoader from '@components/WidgetLoader'

function assertIsDualAxes2DMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is Chart2DWidgetMeta {
    if (meta.type !== 'DualAxes2D') {
        throw new Error('Not a DualAxes2D meta')
    }
}

const DualAxes2D: WidgetComponentType = ({ widgetMeta }) => {
    assertIsDualAxes2DMeta(widgetMeta)
    return (
        <WidgetLoader widgetMeta={widgetMeta}>
            <DashboardCard meta={widgetMeta}>
                <Chart meta={widgetMeta} />
            </DashboardCard>
        </WidgetLoader>
    )
}

export default DualAxes2D
