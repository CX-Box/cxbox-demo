import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'

export interface GroupingHierarchyItemNode extends CustomDataItem {
    _parentGroupPath: string
}

export interface GroupingHierarchyGroupNode extends CustomDataItem {
    _groupPath: string
    _countOfRecordsPerLevel: Record<number, number>
    _groupLevel: number
    children: (GroupingHierarchyGroupNode | GroupingHierarchyItemNode)[]
}

export interface GroupingHierarchyEmptyGroupNode extends GroupingHierarchyGroupNode {
    _emptyNode: boolean
    _emptyNodeLastLevel: number
}

export type GroupingHierarchyCommonNode = CustomDataItem &
    Partial<GroupingHierarchyGroupNode> &
    Partial<GroupingHierarchyItemNode> &
    Partial<GroupingHierarchyEmptyGroupNode>

export interface EmptyNodesStructureNode {
    key: string
    values: EmptyNodesStructureValue[]
}

export interface EmptyNodesStructureValue {
    value: string
    emptyStatusValue?: string
    child?: EmptyNodesStructureNode
}
