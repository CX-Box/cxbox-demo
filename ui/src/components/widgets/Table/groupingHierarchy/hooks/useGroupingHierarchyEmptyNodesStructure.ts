import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useEffect, useState } from 'react'
import { EmptyNodesStructureNode } from '@components/widgets/Table/groupingHierarchy'
import { usePrevious } from '@hooks/usePrevious'

export const useGroupingHierarchyEmptyNodesStructure = (bcName: string, sortedGroupKeys: string[]) => {
    const bcRowMeta = useAppSelector(state => {
        const bcUrl = buildBcUrl(bcName, true, state)
        return bcUrl ? state.view.rowMeta[bcName]?.[bcUrl] : undefined
    })
    const rowMetaInProgress = useAppSelector(state => {
        return state.view.metaInProgress[bcName]
    })
    const rowMetaGroupingHierarchyEmptyNodesStructure = bcRowMeta?.fields.find(
        field => sortedGroupKeys.includes(field.key) && field.groupingHierarchyEmptyNodesStructure
    )?.groupingHierarchyEmptyNodesStructure

    const [groupingHierarchyEmptyNodesStructure, setGroupingHierarchyEmptyNodesStructure] = useState<
        EmptyNodesStructureNode | undefined | null
    >()
    // set the first available value
    useEffect(() => {
        if (!rowMetaInProgress && !groupingHierarchyEmptyNodesStructure && groupingHierarchyEmptyNodesStructure !== null) {
            setGroupingHierarchyEmptyNodesStructure(rowMetaGroupingHierarchyEmptyNodesStructure ?? null)
        }
    }, [groupingHierarchyEmptyNodesStructure, rowMetaGroupingHierarchyEmptyNodesStructure, rowMetaInProgress])

    const previousGroupingHierarchyEmptyNodesStructure = usePrevious(rowMetaGroupingHierarchyEmptyNodesStructure)
    // update the structure if the structure changes when the active cursor changes
    useEffect(() => {
        if (
            (groupingHierarchyEmptyNodesStructure &&
                previousGroupingHierarchyEmptyNodesStructure !== rowMetaGroupingHierarchyEmptyNodesStructure &&
                JSON.stringify(previousGroupingHierarchyEmptyNodesStructure) !==
                    JSON.stringify(rowMetaGroupingHierarchyEmptyNodesStructure)) ||
            (groupingHierarchyEmptyNodesStructure === null && rowMetaGroupingHierarchyEmptyNodesStructure)
        ) {
            setGroupingHierarchyEmptyNodesStructure(rowMetaGroupingHierarchyEmptyNodesStructure)
        }
    }, [groupingHierarchyEmptyNodesStructure, previousGroupingHierarchyEmptyNodesStructure, rowMetaGroupingHierarchyEmptyNodesStructure])

    return groupingHierarchyEmptyNodesStructure
}
