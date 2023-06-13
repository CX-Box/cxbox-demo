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

import { FieldType, RowMetaField, WidgetListField } from '@cxbox-ui/core'

/**
 * Function of calculate hierarchy column width
 *
 * @param columnName Witch column is match
 * @param depthLevel Hierarchy level
 * @param fields Widget fields
 * @param rowMetaFields Widget field meta
 * @param maxDepth Maximum hierarchy depth level
 * @param width Custom column width
 *
 * function return string value as number with 'px' or null
 * example '100px'
 * Last column dont math width and return null value
 */
export function getColumnWidth(
    columnName: string,
    depthLevel: number,
    fields: WidgetListField[],
    rowMetaFields: RowMetaField[],
    maxDepth: number,
    width?: number
): string {
    const indentLevel = depthLevel - 1
    // exclude hidden fields
    const showedFields = fields
        ?.filter(item => {
            const rowMetaField = rowMetaFields?.find(itemRowMeta => itemRowMeta.key === item.key)
            if (rowMetaField) {
                return !rowMetaField.hidden
            }
            return true
        })
        ?.filter(item => item.type !== FieldType.hidden)
        ?.filter(item => !item.hidden)
    const currentField = showedFields?.find(item => item.key === columnName)
    const columnKey = showedFields?.indexOf(currentField)
    const currentColumnShift = currentField?.hierarchyShift
    const nextColumnShift = showedFields[columnKey + 1]?.hierarchyShift
    // Ability to set last column width if one of previous columns have width = 0
    const notFixedWidthColumn = showedFields?.find(item => item.width === 0)
    const isLast = columnKey === showedFields?.length - 1

    // this column should take all available width
    if (width === 0) {
        return null
    }

    if (columnName === '_indentColumn') {
        // 60px as base width _identColumn
        return nextColumnShift ? `${(width || 60) + indentLevel * 20}px` : `${(width || 60) + (maxDepth > 3 ? 3 : maxDepth) * 20}px`
    }

    if (isLast && !notFixedWidthColumn) {
        return null
    }

    if (currentColumnShift && !nextColumnShift && !isLast) {
        // 250px as base width all columns
        return `${(width || 250) - indentLevel * 20}px`
    }

    if (!currentColumnShift && nextColumnShift) {
        // 250px as base width all columns
        return `${(width || 250) + indentLevel * 20}px`
    }

    return width?.toString() + 'px' || null
}
