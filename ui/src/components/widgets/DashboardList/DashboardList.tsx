import React from 'react'
import Table from '../Table/Table'
import { AppWidgetTableMeta } from '../../../interfaces/widget'

interface DashboardListProps {
    meta: AppWidgetTableMeta
}

function DashboardList({ meta }: DashboardListProps) {
    return (
        <div>
            <Table meta={meta} />
        </div>
    )
}

export default React.memo(DashboardList)
