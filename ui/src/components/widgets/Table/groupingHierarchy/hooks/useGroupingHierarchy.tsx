import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '@store'
import { AppWidgetGroupingHierarchyMeta } from '@interfaces/widget'
import { useExpandableGroup } from '@components/widgets/Table/hooks/useExpandableGroup'
import Button from '@components/ui/Button/Button'
import styles from '@components/widgets/Table/Table.less'
import { Icon, Tooltip } from 'antd'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
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
    const bcPageLimit = useAppSelector(state => state.screen.bo.bc[meta.bcName].limit)
    const sorters = useAppSelector(state => state.screen.sorters[meta.bcName])
    const filters = useAppSelector(state => state.screen.filters[meta.bcName])
    const bcCount = useAppSelector(state => state.view.bcRecordsCount[meta.bcName]?.count)
    const correctGroupingCount = bcPageLimit != null && bcCount != null && bcPageLimit >= bcCount
    const bcData = useAppSelector(state => state.data[meta.bcName] as T[] | undefined)
    const groupingHierarchyEmptyNodes = useGroupingHierarchyLevels(meta, sortedGroupKeys)
    const aggFields = meta.options?.groupingHierarchy?.aggFields
    const aggLevels = meta.options?.groupingHierarchy?.aggLevels

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
            setEnabledGrouping(correctGroupingCount)
        }
    }, [correctGroupingCount, isGroupingHierarchy])

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

    const toggleEnabledGrouping = useCallback(() => {
        setEnabledGrouping(enabledGrouping => !enabledGrouping)
    }, [])

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
        return tableContainerRef.current?.querySelector(`[data-row-key="${rowKey}"]`) ?? null
    }, [])

    const getFirstRowElement = useCallback(() => {
        return getRowElement(getFirstRowKey())
    }, [getFirstRowKey, getRowElement])

    const getRowElementByRowId = useCallback(
        (rowId: string | null) => {
            return getRowElement(getGroupingHierarchyRowKeyByRecordId(rowId as string))
        },
        [getGroupingHierarchyRowKeyByRecordId, getRowElement]
    )

    const { showUp, scrollToTop } = useScrollToTopForTable(enabledGrouping, getFirstRowElement)

    useAutoScrollToEditedRow(meta, isGroupingHierarchy, getRowElementByRowId, openTreeToLeaf)

    const { t } = useTranslation()

    const renderTopButton = useCallback(() => {
        return showUp ? (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button
                    className={styles.moveToTop}
                    type="empty"
                    onClick={() => {
                        scrollToTop()
                    }}
                    icon="arrow-up"
                />
            </div>
        ) : undefined
    }, [scrollToTop, showUp])

    const hierarchyToggleButtonElement = useMemo(() => {
        return isGroupingHierarchy ? (
            <Tooltip
                title={
                    !correctGroupingCount
                        ? t(
                              `Warning! {{count}} rows were fetched from backend - limit for "Grouping Hierarchy" mode is {{limit}}. Only "List" mode is available`,
                              { limit: bcPageLimit, count: bcCount }
                          )
                        : undefined
                }
                trigger="hover"
            >
                <div style={{ display: 'inline-block' }}>
                    <Button
                        type="empty"
                        className={cn(styles.treeButton, { [styles.active]: enabledGrouping })}
                        disabled={!correctGroupingCount}
                        onClick={toggleEnabledGrouping}
                    >
                        <Icon type="apartment" />
                    </Button>
                </div>
            </Tooltip>
        ) : null
    }, [bcCount, bcPageLimit, correctGroupingCount, enabledGrouping, isGroupingHierarchy, t, toggleEnabledGrouping])

    return {
        enabledGrouping,
        toggleEnabledGrouping,
        sortedGroupKeys,
        changeExpand,
        clearExpand,
        expandedParentRowKeys,
        tree,
        getFirstRowKey,
        getGroupingHierarchyRowKeyByRecordId,
        openTreeToLeaf,
        renderTopButton,
        tableContainerRef,
        hierarchyToggleButtonElement
    }
}
