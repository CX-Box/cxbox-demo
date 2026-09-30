import React from 'react'
import { AppWidgetGroupingHierarchyMeta } from '@interfaces/widget'
import Table from '@components/widgets/Table/Table'

interface GroupingHierarchyProps {
    meta: AppWidgetGroupingHierarchyMeta
}

const GroupingHierarchy: React.FC<GroupingHierarchyProps> = ({ meta }) => {
    return <Table meta={meta} isGroupingHierarchy={true} />
}

export default React.memo(GroupingHierarchy)
