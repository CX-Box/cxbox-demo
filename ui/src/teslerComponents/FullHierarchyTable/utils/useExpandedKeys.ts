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
import { FullHierarchyDataItem } from '@teslerComponents/FullHierarchyTable/FullHierarchyTable'
import { BcFilter } from '@tesler-ui/core'

const emptyArray: string[] = []

/**
 * State hook to calculate currently expanded rows
 *
 * Auto expanded records:
 * - all of `defaultExpandedKeys`
 * - all ancestors of each `selectedRecords`
 * - all ancestors of `data` records matching `filters`
 *
 * @param defaultExpandedKeys TODO
 * @param selectedRecords TODO
 * @param data TODO
 * @param filters TODO
 * @param searchAncestorsKeys TODO
 * @param hierarchyDisableDescendants Disable searched item descendants in fullHierarchy search
 */
export function useExpandedKeys(
    defaultExpandedKeys: string[],
    selectedRecords: FullHierarchyDataItem[],
    data: FullHierarchyDataItem[],
    filters: BcFilter[],
    searchAncestorsKeys: Set<string>,
    hierarchyDisableDescendants?: boolean
) {
    const haveData = React.useRef(false)
    const [expandedKeys, setExpandedKeys] = React.useState<string[]>([])
    React.useEffect(() => {
        // we should expand hierarchy one time when it's loaded
        if (haveData.current || !data?.length) {
            if (!data?.length) {
                haveData.current = false
            }
            return
        }
        haveData.current = true

        /**
         * All ancestors of selected record should be expanded
         */
        const selectedBranches = selectedRecords.reduce<string[]>((prev, next) => {
            let ancestor = data.find(item => item.id === next.parentId)
            while (ancestor?.parentId) {
                prev.push(ancestor.id)
                ancestor = data.find(item => item.id === ancestor.parentId)
            }
            return prev
        }, [])
        const distinctExpandedKeys = new Set([...expandedKeys, ...(defaultExpandedKeys || emptyArray), ...selectedBranches])
        setExpandedKeys([...Array.from(distinctExpandedKeys)])
    }, [defaultExpandedKeys, selectedRecords, data])

    /**
     * All ancestors of search result record should be expanded
     */
    React.useEffect(() => {
        if (!filters?.length) {
            return
        }
        const ancestorsData = filters && data.filter(item => searchAncestorsKeys.has(item.id))
        const searchResultBranches = filters?.length
            ? ancestorsData
                  ?.filter(item => {
                      return ancestorsData.some(child => item.id === child.parentId)
                  })
                  .map(item => item.id)
            : emptyArray
        const distinctExpandedKeys = new Set([...expandedKeys, ...searchResultBranches])
        hierarchyDisableDescendants
            ? setExpandedKeys(Array.from(searchResultBranches))
            : setExpandedKeys(prev => [...prev, ...Array.from(distinctExpandedKeys)])
    }, [filters, data, searchAncestorsKeys, hierarchyDisableDescendants])
    return [expandedKeys, setExpandedKeys] as const
}
