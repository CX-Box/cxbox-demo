import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { BcFilter, BcMeta, utils } from '@cxbox-ui/core'
import { mapRefinerKeyToFieldKey } from '@components/widgets/CalendarList/interfaces'
import {
    createMonthEndFilter,
    createMonthStartFilter,
    createYearEndFilter,
    createYearStartFilter
} from '@components/widgets/CalendarList/utils'
import { isCalendarWidget } from '@constants/widget'

export const createDefaultFilter = (widget: AppWidgetMeta | undefined, bc: BcMeta) => {
    if (isCalendarWidget(widget)) {
        const calendarOption = widget.options?.calendar
        const refinerKeyToFieldKeyMapper = mapRefinerKeyToFieldKey(calendarOption)

        const oldFilters = utils.parseFilters(bc.defaultFilter) ?? []
        const newFilters: BcFilter[] = [...oldFilters]

        ;[refinerKeyToFieldKeyMapper.start, refinerKeyToFieldKeyMapper.end].forEach(fieldKey => {
            const oldFilterIndex = oldFilters.findIndex(filter => filter.fieldName === fieldKey)
            if (oldFilters[oldFilterIndex]?.fieldName !== fieldKey && fieldKey === refinerKeyToFieldKeyMapper.start) {
                switch (widget.type) {
                    case CustomWidgetTypes.CalendarList:
                        newFilters.push(createMonthStartFilter(fieldKey))
                        break
                    case CustomWidgetTypes.CalendarYearList:
                        newFilters.push(createYearStartFilter(fieldKey))
                        break
                }
            } else if (oldFilters[oldFilterIndex]?.fieldName !== fieldKey && fieldKey === refinerKeyToFieldKeyMapper.end) {
                switch (widget.type) {
                    case CustomWidgetTypes.CalendarList:
                        newFilters.push(createMonthEndFilter(fieldKey))
                        break
                    case CustomWidgetTypes.CalendarYearList:
                        newFilters.push(createYearEndFilter(fieldKey))
                        break
                }
            }
        })

        const filterParams = utils.getFilters(newFilters)

        return filterParams ? new URLSearchParams(filterParams).toString() : bc.defaultFilter
    }

    return bc.defaultFilter
}

const areArraysEqualOrdered = (arr1: any | undefined, arr2: any | undefined) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        return false
    }

    if (arr1.length !== arr2.length) {
        return false
    }

    return arr1.every((value, index) => value === arr2[index])
}

export const isSameFilter = (firstFilter: BcFilter, secondFilter: BcFilter) => {
    return (
        firstFilter.fieldName === secondFilter.fieldName &&
        firstFilter.type === secondFilter.type &&
        (areArraysEqualOrdered(firstFilter.value, secondFilter.value) || firstFilter.value === secondFilter.value)
    )
}
