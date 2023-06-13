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

import { AssociatedItem } from '@cxbox-ui/core'
import { BcFilter } from '@cxbox-ui/core'

/**
 * Function to memoize
 */
type SearchFunction = (...args: any[]) => Set<string>

/**
 * Hierarchy component helper for memoizing search results shared between all instances of component
 * (React hooks are instance-based and not applicable for recursion-based hierarchy)
 */
export class HierarchySearchCache {
    /**
     * Stores memoized Set<string> results based on widget name, data and filters
     */
    private cache: {
        [widgetName: string]: Map<AssociatedItem[], Map<BcFilter[], Set<string>>>
    } = {}

    /**
     * Empty `data` or `filters` arguments don't fire a function at all
     */
    private readonly emptyResult: Set<string> = new Set()

    /**
     * Search for a value through the instance cache based on widgetName, data and filters references.
     * If the value found return it, otherwise run the function and store result in cache.
     *
     * @param func Function to memoize
     * @param widgetName Widget name
     * @param data Data array (should keep persistant reference)
     * @param filters Filters array (should keep persistant reference)
     */
    getValue(func: SearchFunction, widgetName: string, data: AssociatedItem[], filters: BcFilter[]) {
        if (!data || !filters || !data?.length || !filters?.length) {
            return this.emptyResult
        }
        const cacheHit = this.cache[widgetName]?.get(data)?.get(filters)
        if (cacheHit) {
            return cacheHit
        }
        this.cache[widgetName] = this.cache[widgetName] ?? new Map()
        if (!this.cache[widgetName].has(data)) {
            this.cache[widgetName].set(data, new Map())
        }
        this.cache[widgetName].get(data).set(filters, func())
        return this.cache[widgetName].get(data).get(filters)
    }

    /**
     * Clear the cache for the specified widget name
     *
     * @param widgetName Widget name
     */
    clear(widgetName: string) {
        delete this.cache[widgetName]
    }
}
