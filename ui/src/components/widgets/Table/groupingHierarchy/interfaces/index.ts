import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { countersTypeToParamKey } from '@components/widgets/Table/groupingHierarchy/constants'

export type CounterType = keyof typeof countersTypeToParamKey

export interface GroupingHierarchyItemNode extends CustomDataItem {
    _parentGroupPath: string
}

export interface GroupingHierarchyGroupNode extends CustomDataItem {
    _groupPath: string
    _countOfRecordsPerLevel: Record<number, number>
    _countOfGroupsAndRecordsPerLevel: Record<number, number>
    _groupLevel: number
    children: (GroupingHierarchyGroupNode | GroupingHierarchyItemNode)[]
    _aggFunctions?: Record<string, string>
}

export interface GroupingHierarchyEmptyGroupNode extends GroupingHierarchyGroupNode {
    _emptyNode: boolean
    _emptyNodeLastLevel: number
}

export type GroupingHierarchyCommonNode = CustomDataItem &
    Partial<GroupingHierarchyGroupNode> &
    Partial<GroupingHierarchyItemNode> &
    Partial<GroupingHierarchyEmptyGroupNode>

export interface EmptyNodeLevel {
    value: string
    child?: EmptyNodeLevel[]
    defaultExpanded?: boolean | null
    options?: null
}
