import { memo } from 'react'
import { Chart2DWidgetMeta } from '@interfaces/widget'
import Chart from '@components/Chart/Chart'
import DashboardCard from '@components/DashboardCard/DashboardCard'

interface Column2DProps {
    meta: Chart2DWidgetMeta
}

export const Column2D = memo<Column2DProps>(({ meta }) => {
    return (
        <DashboardCard meta={meta}>
            <Chart meta={meta} />
        </DashboardCard>
    )
})
