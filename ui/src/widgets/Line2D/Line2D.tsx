import { memo } from 'react'
import { Chart2DWidgetMeta } from '@interfaces/widget'
import Chart from '@components/Chart/Chart'
import DashboardCard from '@components/DashboardCard/DashboardCard'

interface Line2DProps {
    meta: Chart2DWidgetMeta
}

export const Line2D = memo<Line2DProps>(({ meta }) => {
    return (
        <DashboardCard meta={meta}>
            <Chart meta={meta} />
        </DashboardCard>
    )
})
