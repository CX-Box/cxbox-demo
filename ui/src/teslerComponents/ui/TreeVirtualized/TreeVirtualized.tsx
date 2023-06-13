/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { RefCallback } from 'react'
import { FixedSizeList, FixedSizeListProps, ListChildComponentProps, Align } from 'react-window'
import TreeVirtualizedNode from './TreeVirtualizedNode'
import { useSearchResult } from './useSearchResult'
import { useMatchingNodes } from './useMatchingNodes'
import { WidgetListField } from '@cxbox-ui/core'
import { BcFilter, FilterType } from '@cxbox-ui/core'
import { DataNode, TreeNodeBidirectional } from '@cxbox-ui/core'
import { assignTreeLinks, getDescendants, presort } from '@cxbox-ui/core'

/**
 * Properties for TreeVirtualized component
 */
export interface TreeVirtualizedProps<T> extends Omit<FixedSizeListProps, 'itemCount' | 'children'> {
    /**
     * Flat array of nodes
     */
    items: T[]
    /**
     * Fields to display as tree node
     */
    fields: WidgetListField[]
    /**
     * Allow selecting multiple items
     */
    multiple?: boolean
    /**
     * Fired when node is selected
     */
    onSelect?: ((item: T) => void) | ((item: T, selected: boolean) => void)
    /**
     * Custom node render can be provided
     */
    children?: React.ComponentType<ListChildComponentProps>
    /**
     * Filters for the tree
     */
    filters?: BcFilter[]
    /**
     * If true, casing of searchExpression will be respected
     */
    matchCase?: boolean
}

/**
 * Container element containing console helpers for autotests
 */
export type TreeVirtualizedDomContainer = HTMLDivElement & {
    /**
     * Scroll to the specified item
     *
     * @param column Target column key
     * @param value Target cell value
     * @param align `react-window` Align
     */
    scrollToItem(column: string, value: string, align?: Align): void
}

/**
 * Initially expanded node.
 */
const initialExpanded: Record<string, boolean> = { '0': true }

/**
 * Tree component based on `react-window` to virtualize tree data.
 *
 * @param props Component properties
 * @category Components
 */
export function TreeVirtualized<T extends DataNode>(props: TreeVirtualizedProps<T>) {
    const { items, fields, filters, matchCase, children, ...rest } = props
    /**
     * Flat representation with assigned parent and children references
     */
    const [flatTree, setFlatTree] = React.useState<TreeNodeBidirectional[]>()
    React.useEffect(() => {
        const nextFlatTree = assignTreeLinks(items)
        setFlatTree(presort(nextFlatTree))
    }, [items])
    /**
     * An array of ids for expanded nodes
     */
    const [expandedNodes, setExpandedNodes] = React.useState(Object.keys(initialExpanded))
    /**
     * Search function for filtering nodes array
     */
    const searchPredicate = React.useCallback(
        item => {
            return filters
                ?.filter(filter => filter.type === FilterType.contains)
                .every(filter => {
                    const src = String(item[filter.fieldName] ?? '')
                    const target = String(filter.value ?? '')
                    return props.matchCase ? src.includes(target) : src.toLowerCase().includes(target.toLowerCase())
                })
        },
        [props.matchCase, filters]
    )
    /**
     * An array of ids for nodes matching the search expression, also updates expanded nodes on every search
     */
    const foundNodes = useMatchingNodes(flatTree, filters?.length && searchPredicate, setExpandedNodes)
    /**
     * Items to display with respect to search expression and expanded
     * (both manually or due to matching the search expression) nodes
     */
    const resultItems = useSearchResult(flatTree, foundNodes, expandedNodes)
    /**
     * Toggles expanded status for a node; on collapsing, all descendants are also collapsed
     */
    const handleToggle = React.useCallback(
        (id: string) => {
            if (expandedNodes.includes(id)) {
                const exclude = [id]
                const index = flatTree.findIndex(item => item.id === id)
                getDescendants(flatTree[index].children, exclude)
                setExpandedNodes(expandedNodes.filter(item => !exclude.includes(item)))
            } else {
                setExpandedNodes([...expandedNodes, id])
            }
        },
        [expandedNodes, flatTree]
    )
    /**
     * react-window memoized item descriptors
     */
    const memoizedData = React.useMemo(() => {
        return {
            items: resultItems,
            fields,
            filters,
            expandedItems: expandedNodes,
            multiple: props.multiple,
            onToggle: handleToggle,
            onSelect: props.onSelect
        }
    }, [resultItems, handleToggle, expandedNodes, filters, fields, props.multiple, props.onSelect])
    /**
     * Console helpers for auto tests
     */
    const outerRef = React.useRef<TreeVirtualizedDomContainer>()
    const autotestUtils: RefCallback<FixedSizeList> = React.useCallback(
        node => {
            if (node && outerRef.current) {
                outerRef.current.scrollToItem = (value, column, align) => {
                    const rowIndex = resultItems.findIndex(item => (item as any)[column] === value)
                    node.scrollToItem(rowIndex, align)
                }
            }
        },
        [resultItems]
    )
    return (
        <FixedSizeList
            {...rest}
            outerRef={outerRef}
            ref={autotestUtils}
            className="TreeVirtualized__container"
            itemCount={memoizedData.items.length}
            itemData={memoizedData}
        >
            {children || TreeVirtualizedNode}
        </FixedSizeList>
    )
}

/**
 * @category Components
 */
const MemoizedTreeVirtualized = React.memo(TreeVirtualized) as typeof TreeVirtualized

export default MemoizedTreeVirtualized
