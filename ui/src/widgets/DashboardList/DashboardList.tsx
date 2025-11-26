import React from 'react'
import Table from '@components/Table/Table'
import { AppWidgetTableMeta } from '@interfaces/widget'
import DashboardCard from '@components/DashboardCard/DashboardCard'

interface DashboardListProps {
    meta: AppWidgetTableMeta
}

function DashboardList({ meta }: DashboardListProps) {
    return (
        <DashboardCard meta={meta}>
            <div>
                <Table meta={meta} />
            </div>
        </DashboardCard>
    )
}

export default React.memo(DashboardList)
