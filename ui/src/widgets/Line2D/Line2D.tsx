import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import Chart from '@components/Chart/Chart'
import { Chart2DWidgetMeta } from '@interfaces/widget'
import DashboardCard from '@components/DashboardCard/DashboardCard'
import WidgetLoader from '@components/WidgetLoader'

function assertIsLine2DMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is Chart2DWidgetMeta {
    if (meta.type !== 'Line2D') {
        throw new Error('Not a Line2D meta')
    }
}

const Line2D: WidgetComponentType = ({ widgetMeta }) => {
    assertIsLine2DMeta(widgetMeta)
    return (
        <WidgetLoader widgetMeta={widgetMeta}>
            <DashboardCard meta={widgetMeta}>
                <Chart meta={widgetMeta} />
            </DashboardCard>
        </WidgetLoader>
    )
}

export default Line2D
