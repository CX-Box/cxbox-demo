import React from 'react'
import { AppWidgetGroupingHierarchyMeta } from '@interfaces/widget'
import Table from '@components/Table/Table'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import DefaultCard from '@components/DefaultCard'

function assertIsGroupingHierarchyMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is AppWidgetGroupingHierarchyMeta {
    if (meta.type !== 'GroupingHierarchy') {
        throw new Error('Not a GroupingHierarchy meta')
    }
}

const GroupingHierarchy: WidgetComponentType = ({ widgetMeta }) => {
    assertIsGroupingHierarchyMeta(widgetMeta)
    return (
        <DefaultCard meta={widgetMeta}>
            <Table meta={widgetMeta} isGroupingHierarchy={true} disableMassMode={true} />
        </DefaultCard>
    )
}

export default React.memo(GroupingHierarchy)
