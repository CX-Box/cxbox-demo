import { BcFilter, FieldType, FilterType } from '@cxbox-ui/core'
import { CustomFieldTypes } from '@interfaces/widget'
import { EFeatureSettingKey } from '@interfaces/session'
import { isRangeFieldType } from '@constants/field'

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
export function getFilterType(fieldType: string) {
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

export function getLocalFilterType(fieldType: string, options: { [EFeatureSettingKey.filterByRangeEnabled]?: boolean }) {
    // The filter is converted on the frontend before being sent.
    if (isRangeFieldType(fieldType, options)) {
        return FilterType.range
    } else {
        return getFilterType(fieldType)
    }
}

export const isPartialRangeFilter = (filter: BcFilter): boolean => {
    return filter.type === FilterType.greaterOrEqualThan || filter.type === FilterType.lessOrEqualThan
}

/**
 * Combines separate filters 'greaterOrEqualThan' and 'lessOrEqualThan' one field at a time into one filter of type 'range'.
 *
 * Warning: This function does not check the field type. It blindly converts any pair OR single instance of 'greaterOrEqualThan'
 * or 'lessOrEqualThan' filters for the same field into a 'range' filter.
 *
 * @param filters
 */
export const transformRangeFilters = (filters: BcFilter[]): BcFilter[] => {
    if (!filters || filters.length === 0) {
        return []
    }

    const hasCandidates = filters.some(isPartialRangeFilter)

    if (!hasCandidates) {
        return filters
    }

    const resultFilters: BcFilter[] = []

    const filtersByField = filters.reduce((acc, filter) => {
        if (!acc[filter.fieldName]) {
            acc[filter.fieldName] = []
        }
        acc[filter.fieldName].push(filter)
        return acc
    }, {} as Record<string, BcFilter[]>)

    Object.keys(filtersByField).forEach(fieldName => {
        const fieldFilters = filtersByField[fieldName]

        const greaterFilter = fieldFilters.find(f => f.type === FilterType.greaterOrEqualThan)
        const lessFilter = fieldFilters.find(f => f.type === FilterType.lessOrEqualThan)

        if (greaterFilter || lessFilter) {
            const newRangeFilter = {
                fieldName: fieldName,
                type: FilterType.range,
                value: [greaterFilter?.value ?? null, lessFilter?.value ?? null]
            } as BcFilter

            resultFilters.push(newRangeFilter)

            fieldFilters.forEach(filter => {
                if (filter !== greaterFilter && filter !== lessFilter) {
                    resultFilters.push(filter)
                }
            })
        } else {
            resultFilters.push(...fieldFilters)
        }
    })

    return resultFilters
}
