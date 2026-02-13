import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '@store'
import { AppWidgetGroupingHierarchyMeta } from '@interfaces/widget'
import { useExpandableGroup } from '@components/widgets/Table/hooks/useExpandableGroup'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'
import { nodeHasGroupWithCertainCountOfChildNodes } from '@components/widgets/Table/groupingHierarchy/utils/nodeHasGroupWithCertainCountOfChildNodes'
import { formGroupPathFromRecord } from '@components/widgets/Table/groupingHierarchy/utils/formGroupPathFromRecord'
import { createTree } from '@components/widgets/Table/groupingHierarchy/utils/createTree'
import { getGroupingHierarchyRowKey } from '@components/widgets/Table/groupingHierarchy/utils/getGroupingHierarchyRowKey'
import { getGroupPaths } from '@components/widgets/Table/groupingHierarchy/utils/getGroupPaths'
import { useGroupingHierarchyLevels } from '@components/widgets/Table/groupingHierarchy/hooks/useGroupingHierarchyLevels'
import { useScrollToTopForTable } from '@components/widgets/Table/groupingHierarchy/hooks/useScrollToTopForTable'
import { useAutoScrollToEditedRow } from '@components/widgets/Table/groupingHierarchy/hooks/useAutoScrollToEditedRow'
import { useCheckLimit } from '@hooks/useCheckLimit'
import { getProcessedAggFields } from '@components/widgets/Table/groupingHierarchy/utils/aggregation'

export const useGroupingHierarchy = <T extends CustomDataItem>(
    meta: AppWidgetGroupingHierarchyMeta,
    isGroupingHierarchy: boolean = false
) => {
    const [enabledGrouping, setEnabledGrouping] = useState<boolean>(false)
    const groupingHierarchy = meta.options?.groupingHierarchy
    const sortedGroupKeys = useMemo(
        () => meta.fields.filter(field => groupingHierarchy?.fields.includes(field.key)).map(field => field.key),
        [groupingHierarchy?.fields, meta.fields]
    )
    const bcLoading = useAppSelector(state => state.screen.bo.bc[meta.bcName].loading)
    const sorters = useAppSelector(state => state.screen.sorters[meta.bcName])
    const filters = useAppSelector(state => state.screen.filters[meta.bcName])
    const bcData = useAppSelector(state => state.data[meta.bcName] as T[] | undefined)
    const groupingHierarchyEmptyNodes = useGroupingHierarchyLevels(meta, sortedGroupKeys)
    const { bcPageLimit, isIncorrectLimit, bcCountForShowing } = useCheckLimit(meta.bcName)

    const { aggFields, aggLevels } = useMemo(
        () =>
            getProcessedAggFields(sortedGroupKeys, meta.options?.groupingHierarchy?.aggFields, meta.options?.groupingHierarchy?.aggLevels),
        [meta.options?.groupingHierarchy?.aggFields, meta.options?.groupingHierarchy?.aggLevels, sortedGroupKeys]
    )

    const { tree, nodeDictionary, groupsDictionary, defaultExtendedDictionary } = useMemo(
        () =>
            isGroupingHierarchy
                ? createTree(bcData, sortedGroupKeys, meta.fields, groupingHierarchyEmptyNodes, sorters, filters, aggFields, aggLevels)
                : { tree: undefined, nodeDictionary: undefined, groupsDictionary: undefined, defaultExtendedDictionary: undefined },
        [aggFields, aggLevels, bcData, filters, groupingHierarchyEmptyNodes, isGroupingHierarchy, meta.fields, sortedGroupKeys, sorters]
    )
    const { expandedParentRowKeys, changeExpand, clearExpand } = useExpandableGroup()

    useEffect(() => {
        if (isGroupingHierarchy) {
            setEnabledGrouping(!isIncorrectLimit)
        }
    }, [isIncorrectLimit, isGroupingHierarchy])

    const getFlatTree = useCallback(() => {
        return nodeDictionary ? Object.values(nodeDictionary) : undefined
    }, [nodeDictionary])

    const getGroupKeysWithCertainCountOfChildNodes = useCallback(
        (flatTree: typeof tree, childNodesCounts: number[]) => {
            return flatTree
                ?.filter(node => nodeHasGroupWithCertainCountOfChildNodes(node, childNodesCounts, 'groupAndRecords'))
                .flatMap(node => {
                    const levels = node._countOfRecordsPerLevel && Object.keys(node._countOfRecordsPerLevel).map(Number)
                    return levels
                        ?.filter(level => nodeHasGroupWithCertainCountOfChildNodes(node, childNodesCounts, 'groupAndRecords', level))
                        .map(level => formGroupPathFromRecord(node, sortedGroupKeys, level))
                })
        },
        [sortedGroupKeys]
    )

    useEffect(() => {
        if (isGroupingHierarchy) {
            const flatTree = getFlatTree()

            if (!bcLoading && flatTree?.length) {
                const groupKeys =
                    getGroupKeysWithCertainCountOfChildNodes(flatTree, [0, 1])?.filter(
                        groupKey => typeof defaultExtendedDictionary?.[groupKey as string] !== 'boolean'
                    ) ?? []

                defaultExtendedDictionary && Object.keys(defaultExtendedDictionary).forEach(path => groupKeys.push(path))

                groupKeys?.forEach(groupPath => {
                    groupPath && changeExpand(defaultExtendedDictionary?.[groupPath] ?? true, groupPath)
                })
            }
        }
    }, [
        bcLoading,
        changeExpand,
        defaultExtendedDictionary,
        getFlatTree,
        getGroupKeysWithCertainCountOfChildNodes,
        groupsDictionary,
        isGroupingHierarchy,
        sortedGroupKeys
    ])

    const getFirstRowKey = useCallback(() => {
        const firstCursor = bcData?.find(item => item.id)?.id
        const node = firstCursor && nodeDictionary?.[firstCursor as string]
        return node ? getGroupingHierarchyRowKey(node) : undefined
    }, [bcData, nodeDictionary])

    const getGroupingHierarchyNodeByRecordId = useCallback(
        (id: string | undefined) => {
            return id ? nodeDictionary?.[id] : undefined
        },
        [nodeDictionary]
    )

    const getGroupingHierarchyRowKeyByRecordId = useCallback(
        (id: string | undefined) => {
            const hierarchyNode = getGroupingHierarchyNodeByRecordId(id)
            return hierarchyNode && getGroupingHierarchyRowKey(hierarchyNode)
        },
        [getGroupingHierarchyNodeByRecordId]
    )

    const openTreeToLeaf = useCallback(
        (recordOrId: GroupingHierarchyCommonNode | string | undefined | null) => {
            const record = typeof recordOrId === 'string' ? getGroupingHierarchyNodeByRecordId(recordOrId) : recordOrId

            if (record) {
                getGroupPaths(record, sortedGroupKeys)?.forEach(groupKey => {
                    changeExpand(true, groupKey)
                })
            }
        },
        [changeExpand, getGroupingHierarchyNodeByRecordId, sortedGroupKeys]
    )
    const tableContainerRef = useRef<HTMLDivElement>(null)

    const getRowElement = useCallback((rowKey: string | undefined): Element | null => {
        return tableContainerRef.current?.querySelector(`[data-row-key="${CSS.escape(rowKey ?? '')}"]`) ?? null
    }, [])

    const getFirstRowElement = useCallback(() => {
        return tableContainerRef.current?.querySelector(`[data-row-key]:first-of-type`)
    }, [])

    const getTableTopElement = useCallback(() => {
        return tableContainerRef.current?.querySelector(`.ant-table-scroll`)
    }, [])

    const getRowElementByRowId = useCallback(
        (rowId: string | null) => {
            return getRowElement(getGroupingHierarchyRowKeyByRecordId(rowId as string))
        },
        [getGroupingHierarchyRowKeyByRecordId, getRowElement]
    )

    const { showUp, scrollToTop } = useScrollToTopForTable(enabledGrouping, getFirstRowElement, getTableTopElement)

    useAutoScrollToEditedRow(meta, isGroupingHierarchy, getRowElementByRowId, openTreeToLeaf)

    const sortFieldsByGroupKeys = useCallback(
        (fields: AppWidgetGroupingHierarchyMeta['fields']) => {
            if (!isGroupingHierarchy) {
                return fields
            }

            let firstFields = sortedGroupKeys
                .map(fieldKey => fields.find(field => field.key === fieldKey))
                .filter(field => !!field) as AppWidgetGroupingHierarchyMeta['fields']

            return [...firstFields, ...fields.filter(field => !sortedGroupKeys.includes(field.key))]
        },
        [isGroupingHierarchy, sortedGroupKeys]
    )

    return {
        enabledGrouping,
        setEnabledGrouping,
        sortedGroupKeys,
        changeExpand,
        clearExpand,
        expandedParentRowKeys,
        tree,
        getFirstRowKey,
        getGroupingHierarchyRowKeyByRecordId,
        openTreeToLeaf,
        tableContainerRef,
        isIncorrectLimit,
        bcPageLimit,
        bcCountForShowing,
        sortFieldsByGroupKeys,
        showUp,
        scrollToTop
    }
}
