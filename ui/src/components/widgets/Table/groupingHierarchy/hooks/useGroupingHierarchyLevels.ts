import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useCallback, useEffect, useState } from 'react'
import { usePrevious } from '@hooks/usePrevious'
import { EmptyNodeLevel } from '@components/widgets/Table/groupingHierarchy'
import { AppWidgetGroupingHierarchyMeta } from '@interfaces/widget'

export const useGroupingHierarchyLevels = (meta: AppWidgetGroupingHierarchyMeta, sortedGroupKeys: string[]) => {
    const bcName = meta.bcName
    const bcRowMeta = useAppSelector(state => {
        const bcUrl = buildBcUrl(bcName, true, state)
        return bcUrl ? state.view.rowMeta[bcName]?.[bcUrl] : undefined
    })
    const rowMetaInProgress = useAppSelector(state => {
        return state.view.metaInProgress[bcName]
    })
    const rowMetaGroupingHierarchy = bcRowMeta?.fields.find(
        field => sortedGroupKeys.includes(field.key) && field.defaultGroupingHierarchy
    )?.defaultGroupingHierarchy

    const [groupingHierarchyLevels, setGroupingHierarchyLevels] = useState<EmptyNodeLevel[] | undefined | null>()

    const isValidRowMetaGroupingHierarchy = useCallback(() => {
        const groupByFields = rowMetaGroupingHierarchy?.groupByFields
        const metaGroupingHierarchyFields = meta.options?.groupingHierarchy?.fields

        return (
            groupByFields &&
            groupByFields.length === metaGroupingHierarchyFields?.length &&
            groupByFields
                .map(groupByField => groupByField.name)
                .every((groupByFieldName, index) => groupByFieldName === metaGroupingHierarchyFields[index])
        )
    }, [meta.options?.groupingHierarchy?.fields, rowMetaGroupingHierarchy?.groupByFields])

    const validateRowMetaGroupingHierarchy = useCallback(() => {
        rowMetaGroupingHierarchy &&
            !isValidRowMetaGroupingHierarchy() &&
            console.info(
                'Error: fields in rowMeta do not match fields in widget meta.\n\n',
                `Content rowMeta: ${JSON.stringify(rowMetaGroupingHierarchy.groupByFields, null, 2)}\n\n`,
                `Content meta.options.groupingHierarchy: ${JSON.stringify(meta.options?.groupingHierarchy, null, 2)}\n\n`
            )
    }, [isValidRowMetaGroupingHierarchy, meta.options?.groupingHierarchy, rowMetaGroupingHierarchy])

    // set the first available value
    useEffect(() => {
        if (!rowMetaInProgress && !groupingHierarchyLevels && groupingHierarchyLevels !== null) {
            setGroupingHierarchyLevels(rowMetaGroupingHierarchy?.levels ?? null)
            validateRowMetaGroupingHierarchy()
        }
    }, [groupingHierarchyLevels, rowMetaGroupingHierarchy, rowMetaInProgress, validateRowMetaGroupingHierarchy])

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
            validateRowMetaGroupingHierarchy()
        }
    }, [groupingHierarchyLevels, previousRowMetaGroupingHierarchy, rowMetaGroupingHierarchy, validateRowMetaGroupingHierarchy])

    return groupingHierarchyLevels
}
