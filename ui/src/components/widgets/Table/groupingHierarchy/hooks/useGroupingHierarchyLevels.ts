import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useEffect, useState } from 'react'
import { usePrevious } from '@hooks/usePrevious'
import { EmptyNodeLevel } from '@components/widgets/Table/groupingHierarchy'

export const useGroupingHierarchyLevels = (bcName: string, sortedGroupKeys: string[]) => {
    const bcRowMeta = useAppSelector(state => {
        const bcUrl = buildBcUrl(bcName, true, state)
        return bcUrl ? state.view.rowMeta[bcName]?.[bcUrl] : undefined
    })
    const rowMetaInProgress = useAppSelector(state => {
        return state.view.metaInProgress[bcName]
    })
    const rowMetaGroupingHierarchy = bcRowMeta?.fields.find(
        field => sortedGroupKeys.includes(field.key) && field.groupingHierarchy
    )?.groupingHierarchy

    const [groupingHierarchyLevels, setGroupingHierarchyLevels] = useState<EmptyNodeLevel[] | undefined | null>()
    // set the first available value
    useEffect(() => {
        if (!rowMetaInProgress && !groupingHierarchyLevels && groupingHierarchyLevels !== null) {
            setGroupingHierarchyLevels(rowMetaGroupingHierarchy?.levels ?? null)
        }
    }, [groupingHierarchyLevels, rowMetaGroupingHierarchy, rowMetaInProgress])

    const previousRowMetaGroupingHierarchy = usePrevious(rowMetaGroupingHierarchy)
    // update the structure if the structure changes when the active cursor changes
    useEffect(() => {
        if (
            (rowMetaGroupingHierarchy?.levels.length &&
                previousRowMetaGroupingHierarchy !== rowMetaGroupingHierarchy &&
                JSON.stringify(previousRowMetaGroupingHierarchy?.levels) !== JSON.stringify(rowMetaGroupingHierarchy?.levels)) ||
            (groupingHierarchyLevels === null && rowMetaGroupingHierarchy?.levels)
        ) {
            setGroupingHierarchyLevels(rowMetaGroupingHierarchy.levels)
        }
    }, [groupingHierarchyLevels, previousRowMetaGroupingHierarchy, rowMetaGroupingHierarchy])

    return groupingHierarchyLevels
}
