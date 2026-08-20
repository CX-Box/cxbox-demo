import { BcFilter, FieldType, utils, WidgetFieldBase } from '@cxbox-ui/core'
import { FilterType } from '@interfaces/filters'
import { CustomFieldTypes } from '@interfaces/widget'
import { containsSearchHighlightMatch } from '@utils/searchHighlight'

const TEXT_FIELD_TYPES = new Set<string>([
    FieldType.input,
    FieldType.text,
    FieldType.hint,
    FieldType.pickList,
    FieldType.inlinePickList,
    FieldType.fileUpload,
    CustomFieldTypes.RichText,
    CustomFieldTypes.SuggestionPickList
])

const parseFilterValues = (value: unknown): unknown[] => {
    if (Array.isArray(value)) {
        return value
    }
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed) ? parsed : [value]
        } catch {
            return [value]
        }
    }
    return [value]
}

const toComparableNumber = (value: unknown, fieldType?: string) => {
    if ([FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(fieldType as FieldType)) {
        const timestamp = Date.parse(String(value))
        return Number.isNaN(timestamp) ? undefined : timestamp
    }

    const number = Number(value)
    return Number.isNaN(number) ? undefined : number
}

const equals = (left: unknown, right: unknown) => String(left ?? '') === String(right ?? '')

export const isFieldValueMatchedByFilter = (value: unknown, filter: BcFilter, fieldType?: string): boolean => {
    const filterType = filter.type as FilterType
    const filterValue = filter.value

    switch (filterType) {
        case FilterType.contains: {
            if (!TEXT_FIELD_TYPES.has(fieldType ?? '') || value == null || filterValue == null) {
                return false
            }
            return containsSearchHighlightMatch(String(value), utils.escapedSrc(String(filterValue)))
        }
        case FilterType.equals:
            return equals(value, filterValue)
        case FilterType.equalsOneOf:
            return parseFilterValues(filterValue).some(item => equals(value, item))
        case FilterType.containsOneOf:
            return parseFilterValues(filterValue).some(item =>
                containsSearchHighlightMatch(String(value ?? ''), utils.escapedSrc(String(item ?? '')))
            )
        case FilterType.specified:
        case FilterType.specifiedBooleanSql:
            return Boolean(value) === Boolean(filterValue)
        case FilterType.greaterThan:
        case FilterType.greaterOrEqualThan:
        case FilterType.lessThan:
        case FilterType.lessOrEqualThan: {
            const left = toComparableNumber(value, fieldType)
            const right = toComparableNumber(filterValue, fieldType)
            if (left === undefined || right === undefined) {
                return false
            }
            if (filterType === FilterType.greaterThan) {
                return left > right
            }
            if (filterType === FilterType.greaterOrEqualThan) {
                return left >= right
            }
            if (filterType === FilterType.lessThan) {
                return left < right
            }
            return left <= right
        }
        case FilterType.range: {
            const [from, to] = parseFilterValues(filterValue)
            const current = toComparableNumber(value, fieldType)
            const lower = from == null ? undefined : toComparableNumber(from, fieldType)
            const upper = to == null ? undefined : toComparableNumber(to, fieldType)
            return current !== undefined && (lower === undefined || current >= lower) && (upper === undefined || current <= upper)
        }
        default:
            return false
    }
}

export const getFieldHighlightSearch = (source: string, filter: BcFilter | undefined, fieldType?: string): RegExp | undefined => {
    if (!filter || !isFieldValueMatchedByFilter(source, filter, fieldType)) {
        return undefined
    }

    if (filter.type === FilterType.contains || filter.type === FilterType.equals) {
        return utils.escapedSrc(String(filter.value ?? ''))
    }

    if (filter.type === FilterType.containsOneOf || filter.type === FilterType.equalsOneOf) {
        const matchedValue = parseFilterValues(filter.value).find(item =>
            containsSearchHighlightMatch(source, utils.escapedSrc(String(item ?? '')))
        )
        return matchedValue == null ? undefined : utils.escapedSrc(String(matchedValue))
    }

    return undefined
}

export const isDataItemMatchedByFilters = (dataItem: Record<string, unknown>, filters: BcFilter[], fields: WidgetFieldBase[] = []) => {
    const filtersWithFieldMeta = filters
        .map(filter => ({ filter, field: fields.find(item => item.key === filter.fieldName) }))
        .filter(item => !!item.field)

    return filtersWithFieldMeta.every(({ filter, field }) => {
        return isFieldValueMatchedByFilter(dataItem[filter.fieldName], filter, field?.type)
    })
}
