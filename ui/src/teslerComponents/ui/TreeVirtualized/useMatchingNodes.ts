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
import { TreeNodeAscending } from '@tesler-ui/core'

const initialExpanded: Record<string, boolean> = { '0': true }

/**
 * Filters `nodes` array with `searchPredicate` and calls `setExpandedNodes` with all ancestors of matching nodes
 *
 * @param nodes An array to filter
 * @param searchPredicate Filter condition
 * @param setExpandedNodes Callback to set ancestors
 * @returns A memoized array of matching nodes
 * @category Hooks
 */
export function useMatchingNodes<T extends TreeNodeAscending>(
    nodes: T[],
    searchPredicate: (item: T) => boolean,
    setExpandedNodes: React.Dispatch<React.SetStateAction<string[]>>
) {
    const { matchingNodes, ancestors } = React.useMemo(() => {
        return getMatchingNodes(nodes, searchPredicate)
    }, [nodes, searchPredicate])
    React.useEffect(() => {
        setExpandedNodes(ancestors)
    }, [ancestors, setExpandedNodes])
    return matchingNodes
}

/**
 * Filters `nodes` array with `searchPredicate` and forms an additional array with ancestors for each found node.
 *
 * @param nodes An array to filter
 * @param searchPredicate Filter condition
 * @category Utils
 */
export function getMatchingNodes<T extends TreeNodeAscending>(nodes: T[], searchPredicate: (item: T) => boolean) {
    if (!searchPredicate || !nodes) {
        return { matchingNodes: null, ancestors: Object.keys(initialExpanded) }
    }
    const found = nodes.filter(searchPredicate)
    const newExpandedNodes = { ...initialExpanded }
    found.forEach(item => {
        let parent = item.parent
        while (parent) {
            newExpandedNodes[parent.id] = true
            parent = parent.parent
        }
    })
    return { matchingNodes: found.map(item => item.id), ancestors: Object.keys(newExpandedNodes) }
}
