import { EmptyNodesStructureNode, EmptyNodesStructureValue } from '@components/widgets/Table/groupingHierarchy'

export const dfsEmptyGroupStructureTraversal = (
    emptyNode: EmptyNodesStructureNode,
    parentEmptyNodeValue: EmptyNodesStructureValue | null = null,
    callback: (
        emptyNodeKey: string,
        emptyNode: EmptyNodesStructureNode | EmptyNodesStructureValue,
        parentEmptyNodeValue: EmptyNodesStructureValue | null
    ) => void
) => {
    emptyNode?.values?.forEach(value => {
        callback?.(emptyNode.key, value, parentEmptyNodeValue)

        value.child && dfsEmptyGroupStructureTraversal(value.child, value, callback)
    })
}
