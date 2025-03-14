import { BcFilter, FieldType, FilterType } from '@cxbox-ui/core'
import { CustomFieldTypes } from '@interfaces/widget'

const EMPTY_OBJECT = {}
const normalizeFilterValue = (value: unknown) => {
    return typeof value === 'string' ? value : JSON.stringify(value)
}

export const convertFiltersIntoObject = (filters?: BcFilter[]) => {
    return (
        filters?.reduce((filtersObj: Record<string, any>, filter) => {
            // TODO remove this (if), when the back will support range
            if (filter.type === FilterType.range && Array.isArray(filter.value)) {
                filtersObj[`${filter.fieldName}.${FilterType.greaterOrEqualThan}`] = normalizeFilterValue(filter.value[0])
                filtersObj[`${filter.fieldName}.${FilterType.lessOrEqualThan}`] = normalizeFilterValue(filter.value[1])
            } else {
                const separator = filter.fieldName ? '.' : ''

                filtersObj[`${filter.fieldName}${separator}${filter.type}`] = normalizeFilterValue(filter.value)
            }

            return filtersObj
        }, {}) || EMPTY_OBJECT
    )
}

/**
 * Returns appropriate filtration type for specified field type.
 *
 * - Text-based fields use `contains`
 * - Checkbox fields use `specified` (boolean)
 * - Dictionary fiels use `equalsOneOf`
 *
 * All other field types use strict `equals`
 *
 * @param fieldType Field type
 */
export function getFilterType(fieldType: FieldType | CustomFieldTypes) {
    switch (fieldType) {
        case CustomFieldTypes.MultipleSelect:
        case FieldType.radio:
        case FieldType.dictionary: {
            return FilterType.equalsOneOf
        }
        case FieldType.checkbox: {
            return FilterType.specified
        }
        case CustomFieldTypes.SuggestionPickList:
        case FieldType.inlinePickList:
        case FieldType.pickList:
        case FieldType.input:
        case FieldType.fileUpload:
        case FieldType.text: {
            return FilterType.contains
        }
        default:
            return FilterType.equals
    }
}
