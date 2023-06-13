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
import { HierarchySearchCache } from '@teslerComponents/FullHierarchyTable/utils/hierarchySearchCache'
import { FullHierarchyDataItem } from '@teslerComponents/FullHierarchyTable/FullHierarchyTable'
import { BcFilter } from '@cxbox-ui/core'

const ancestorsKeysCache = new HierarchySearchCache()
const descendantsKeysCache = new HierarchySearchCache()

/**
 * Returns cached search results for full hierarchy widget
 *
 * @param widgetName Full hierarchy widget name
 * @param filters Filters (only text fields supported)
 * @param data Records
 * @param depthLevel Level of the hierarchy for which hook is called
 * @param hierarchyDisableDescendants Disable searched item descendants in fullHierarchy search
 */
export function useHierarchyCache(
    widgetName: string,
    filters: BcFilter[],
    data: FullHierarchyDataItem[],
    depthLevel: number,
    hierarchyDisableDescendants?: boolean
) {
    const isFirstLevel = depthLevel === 1
    React.useEffect(() => {
        const clearSearchCache = () => {
            if (isFirstLevel) {
                ancestorsKeysCache.clear(widgetName)
                descendantsKeysCache.clear(widgetName)
            }
        }
        clearSearchCache()
        return clearSearchCache()
    }, [widgetName, data, isFirstLevel])
    const searchedAncestorsKeys: Set<string> = ancestorsKeysCache.getValue(
        () => {
            const result: string[] = []
            data.forEach(item => {
                bcFilterMatchedAncestors(item, data, filters)?.forEach(key => result.push(key))
            })
            return new Set(result)
        },
        widgetName,
        data,
        filters
    )
    const searchedDescendantsKeys: Set<string> = descendantsKeysCache.getValue(
        () => {
            const result: string[] = []
            data.forEach(item => {
                bcFilterMatchedDescendants(item, data, filters)?.forEach(key => result.push(key))
            })
            return new Set(result)
        },
        widgetName,
        data,
        filters
    )

    const filteredData = React.useMemo(() => {
        return filters?.length
            ? data.filter(
                  item => searchedAncestorsKeys.has(item.id) || (!hierarchyDisableDescendants && searchedDescendantsKeys.has(item.id))
              )
            : data
    }, [searchedAncestorsKeys, searchedDescendantsKeys, data, filters, hierarchyDisableDescendants])
    return [filteredData, searchedAncestorsKeys, searchedDescendantsKeys] as const
}

/**
 * Function match whether filters are assigned to the input data element
 *
 * @param dataItem item to be checked
 * @param filters array of applied filters
 */
function bcFilterTextMatch(dataItem: FullHierarchyDataItem, filters: BcFilter[]) {
    if (filters?.length === 0) {
        return true
    }
    return filters?.every(filter => {
        const filterable = typeof dataItem[filter.fieldName] === 'string' || typeof dataItem[filter.fieldName] === 'number'
        const searchExpression = String(filter.value).toLowerCase()
        const value = String(dataItem[filter.fieldName]).toLowerCase()
        return filterable && value.includes(searchExpression)
    })
}

/**
 * Function search ancestors id in tree by input element dataItem
 *
 * @param dataItem item to be checked
 * @param dataItems full tree dataItems
 * @param filters array of applied filters
 */
function bcFilterMatchedAncestors(dataItem: FullHierarchyDataItem, dataItems: FullHierarchyDataItem[], filters: BcFilter[]) {
    const result: string[] = []
    if (bcFilterTextMatch(dataItem, filters)) {
        let current = dataItem
        // sibling include
        // dataItems.filter(sibling => sibling.parentId === current.parentId).forEach(sibling => result.push(sibling.id))
        do {
            result.push(current.id)
            current = dataItems.find(item => item.id === current.parentId)
        } while (current?.parentId)
    }
    return result
}

/**
 * Function search descendants id in tree by input element dataItem
 *
 * @param dataItem item to be checked
 * @param dataItems full tree dataItems
 * @param filters array of applied filters
 */
function bcFilterMatchedDescendants(dataItem: FullHierarchyDataItem, dataItems: FullHierarchyDataItem[], filters: BcFilter[]) {
    const result: string[] = []
    if (bcFilterTextMatch(dataItem, filters)) {
        const filteredData = [dataItem]
        while (filteredData?.length > 0) {
            const tempAncestor = filteredData.shift()
            result.push(tempAncestor.id)
            const tmpDescendant = dataItems?.filter(item => item.parentId === tempAncestor.id)
            if (tmpDescendant?.length > 0) {
                tmpDescendant.forEach(child => filteredData.push(child))
            }
        }
    }
    return result
}
