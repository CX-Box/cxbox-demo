import { memo } from 'react'
import { DualAxes2DWidgetMeta } from '@interfaces/widget'
import Chart from '@components/Chart/Chart'
import DashboardCard from '@components/DashboardCard/DashboardCard'

interface DualAxes2DProps {
    meta: DualAxes2DWidgetMeta
}

export const DualAxes2D = memo<DualAxes2DProps>(({ meta }) => {
    return (
        <DashboardCard meta={meta}>
            <Chart meta={meta} />
        </DashboardCard>
    )
})
