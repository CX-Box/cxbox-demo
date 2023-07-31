/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../interfaces/storeSlices'

/**
 * Get filters from the store for specific widget and field
 *
 * @param widgetName
 * @param fieldKey
 * @category Hooks
 */
export function useWidgetFilters(widgetName: string, fieldKey: string) {
    return useSelector((store: AppState) => {
        const viewName = store.view.name
        const widget = store.view.widgets.find(item => item.name === widgetName)
        const filters = store.screen.filters[widget?.bcName as string]?.filter(item => {
            let match = item.fieldName === fieldKey
            if (item.viewName) {
                match = match && item.viewName === viewName
            }
            if (item.widgetName) {
                match = match && item.widgetName === widget?.name
            }
            return match
        })
        return filters || []
    })
}

/**
 *
 * @param widgetName
 * @param fieldKey
 * @category Hooks
 */
export function useWidgetHighlightFilter(widgetName: string, fieldKey: string) {
    const filters = useWidgetFilters(widgetName, fieldKey)
    const filter = filters[0]
    return React.useMemo(() => filter, [filter])
}
