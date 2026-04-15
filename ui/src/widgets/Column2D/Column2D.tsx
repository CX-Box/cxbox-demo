import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import Chart from '@components/Chart/Chart'
import { Chart2DWidgetMeta } from '@interfaces/widget'
import DashboardCard from '@components/DashboardCard/DashboardCard'
import WidgetLoader from '@components/WidgetLoader'

function assertIsColumn2DMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is Chart2DWidgetMeta {
    if (meta.type !== 'Column2D') {
        throw new Error('Not a Column2D meta')
    }
}

const Column2D: WidgetComponentType = ({ widgetMeta, mode }) => {
    assertIsColumn2DMeta(widgetMeta)
    return (
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <DashboardCard widgetMeta={widgetMeta} mode={mode}>
                <Chart meta={widgetMeta} />
            </DashboardCard>
        </WidgetLoader>
    )
}

export default Column2D
