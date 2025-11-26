import { memo } from 'react'
import { Pie1DWidgetMeta } from '@interfaces/widget'
import Chart from '@components/Chart/Chart'
import DashboardCard from '@components/DashboardCard/DashboardCard'

interface Pie1DProps {
    meta: Pie1DWidgetMeta
}

export const Pie1D = memo<Pie1DProps>(({ meta }) => {
    return (
        <DashboardCard meta={meta}>
            <Chart meta={meta} />
        </DashboardCard>
    )
})
