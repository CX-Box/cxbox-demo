import React from 'react'
import { AppWidgetGroupingHierarchyMeta } from '@interfaces/widget'
import Table from '@components/Table/Table'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import Card from '@components/Card/Card'
import WidgetLoader from '@components/WidgetLoader'

function assertIsGroupingHierarchyMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is AppWidgetGroupingHierarchyMeta {
    if (meta.type !== 'GroupingHierarchy') {
        throw new Error('Not a GroupingHierarchy meta')
    }
}

const GroupingHierarchy: WidgetComponentType = ({ widgetMeta, mode }) => {
    assertIsGroupingHierarchyMeta(widgetMeta)
    return (
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <Card widgetMeta={widgetMeta} mode={mode}>
                <Table meta={widgetMeta} isGroupingHierarchy={true} disableMassMode={true} />
            </Card>
        </WidgetLoader>
    )
}

export default React.memo(GroupingHierarchy)
