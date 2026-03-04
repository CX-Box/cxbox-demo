import React from 'react'
import Table from '@components/Table/Table'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import DashboardCard from '@components/DashboardCard/DashboardCard'

function assertIsDashboardListMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is AppWidgetTableMeta {
    if (meta.type !== 'DashboardList') {
        throw new Error('Not a DashboardList meta')
    }
}

const DashboardList: WidgetComponentType = ({ widgetMeta }) => {
    assertIsDashboardListMeta(widgetMeta)
    return (
        <DashboardCard meta={widgetMeta}>
            <div>
                <Table meta={widgetMeta} />
            </div>
        </DashboardCard>
    )
}

export default React.memo(DashboardList)
