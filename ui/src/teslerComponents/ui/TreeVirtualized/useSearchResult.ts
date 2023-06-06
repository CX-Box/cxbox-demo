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

import React from 'react'
import { TreeNodeBidirectional, TreeNodeCollapsable } from '@tesler-ui/core'
import { buildSearchResultTree } from '@tesler-ui/core'
import { breadthFirstSearch } from '@tesler-ui/core'

/**
 * Returns a memoized array of matching nodes, their direct children and every ancestor node.
 *
 * Every node is assigned `_expanded` property based on if their parentId present in `expandedNodes` array.
 * Nodes with children additionally expanded if `matchingNodes` includes some of their descendant.
 *
 * @param nodes An array to search
 * @param matchingNodes Ids of the searched nodes
 * @param expandedNodes Ids of the nodes that are expanded
 * @category Hooks
 */
export function useSearchResult<T extends TreeNodeBidirectional>(nodes: T[], matchingNodes: string[], expandedNodes: string[]) {
    return React.useMemo(() => {
        return getSearchResult(nodes, matchingNodes, expandedNodes)
    }, [nodes, matchingNodes, expandedNodes])
}

/**
 * Every node is assigned `_expanded` property if their parentId present in `expandedNodes` array.
 * Only nodes with this flag are returned (i.e. their parent node is expanded).
 *
 * If `matchingNodes` specified, source array of nodes is formed from matching nodes, their direct children
 * and every ancestor node, each of them also assigned `_expanded` property with additional check to keep
 * them collapsed if `matchingNodes` does not include some of their descendants.
 *
 * @param nodes Source array of nodes
 * @param matchingNodes Ids of the searched nodes
 * @param expandedNodes Ids of the nodes that are expanded
 * @category Utils
 */
export function getSearchResult<T extends TreeNodeBidirectional>(
    nodes: T[],
    matchingNodes: string[],
    expandedNodes: string[]
): Array<TreeNodeCollapsable<T>> {
    if (!nodes) {
        return []
    }
    let result: Array<TreeNodeCollapsable<T>> = []
    if (matchingNodes) {
        const searchResultTree = buildSearchResultTree(nodes, matchingNodes)
        result = searchResultTree.map(item => {
            let _expanded = expandedNodes.includes(item.parentId)
            if (item.children) {
                _expanded =
                    _expanded &&
                    !!breadthFirstSearch(
                        item,
                        (data: T) => {
                            return matchingNodes.includes(data.id)
                        },
                        0,
                        'children'
                    )
            }
            return { ...item, _expanded }
        })
    } else {
        result = nodes.map(item => ({ ...item, _expanded: expandedNodes.includes(item.parentId) }))
    }

    return result.filter(item => item._expanded)
}
