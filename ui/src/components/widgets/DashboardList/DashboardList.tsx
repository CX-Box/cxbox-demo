import React from 'react'
import { WidgetTableMeta } from '@cxbox-ui/core/interfaces/widget'
import Table from '../Table/Table'

interface DashboardListProps {
    meta: WidgetTableMeta
}

function DashboardList({ meta }: DashboardListProps) {
    return (
        <div>
            <Table meta={meta} />
        </div>
    )
}

export default React.memo(DashboardList)
