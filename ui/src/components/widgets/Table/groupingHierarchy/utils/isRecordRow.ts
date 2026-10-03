import { GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'
import { totalRowKey } from '@components/widgets/Table/groupingHierarchy/constants'

/**
 * The row shows a record: not an empty group, not a row of aggregates and not the total row
 */
export const isRecordRow = (row: GroupingHierarchyCommonNode) => !row._emptyNode && row.id !== row._groupPath && row.id !== totalRowKey
