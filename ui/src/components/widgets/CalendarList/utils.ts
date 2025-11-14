import { BcFilter, FilterType } from '@cxbox-ui/core'
import { isoLocalFormatter } from '@utils/date'
import moment from 'moment/moment'

const CALENDAR_COL_LENGTH = 7
const CALENDAR_ROW_LENGTH = 6
const CALENDAR_GRID_SIZE = CALENDAR_COL_LENGTH * CALENDAR_ROW_LENGTH

export const getFirstDayOfMonthGrid = (date: moment.MomentInput) => {
    return moment(date).startOf('month').startOf('week')
}

export const getLastDayOfMonthGrid = (date: moment.MomentInput) => {
    const firstDayOfGrid = getFirstDayOfMonthGrid(date)
    return firstDayOfGrid
        .clone()
        .add(CALENDAR_GRID_SIZE - 1, 'days')
        .endOf('day')
}

export const getFirstDayOfYear = (date: moment.MomentInput) => {
    return moment(date).startOf('year')
}

export const getLastDayOfYear = (date: moment.MomentInput) => {
    return moment(date).endOf('year')
}

export const getFirsDay = () => {
    return moment.localeData().firstDayOfWeek()
}

export const createMonthStartFilter = (fieldName: string, date?: Date) => ({
    fieldName,
    type: FilterType.range,
    value: [null, isoLocalFormatter(getLastDayOfMonthGrid(date))]
})

export const createMonthEndFilter = (fieldName: string, date?: Date) => ({
    fieldName,
    type: FilterType.range,
    value: [isoLocalFormatter(getFirstDayOfMonthGrid(date)), null]
})

export const createYearStartFilter = (fieldName: string, date?: Date) => ({
    fieldName,
    type: FilterType.range,
    value: [null, isoLocalFormatter(getLastDayOfYear(date))]
})

export const createYearEndFilter = (fieldName: string, date?: Date) => ({
    fieldName,
    type: FilterType.range,
    value: [isoLocalFormatter(getFirstDayOfYear(date)), null]
})

/**
 * Checks if an event is either a multi-day or a single "all-day" event.
 *
 * @param range A tuple with the start and end of the event.
 */
export const isAllDayOrMultiDay = (range: [moment.MomentInput, moment.MomentInput]) => {
    const momentStart = moment(range[0])
    const momentEnd = moment(range[1])

    if (!momentStart.isValid() || !momentEnd.isValid()) {
        return false
    }

    const isOneAllDay = isBoundariesOfDay([momentStart, momentEnd], momentStart) // с 00:00:00 до 23:59:59

    const isMultiDay = !momentStart.isSame(momentEnd, 'day')

    return isOneAllDay || isMultiDay
}

/**
 * Extracts the intersection date bounds [start, end] from a filters array.
 *
 * Supported representations:
 *  1) Two 'range' filters (separately for the start and end fields):
 *     - for the start field, the upper bound of the range is taken,
 *     - for the end field, the lower bound of the range is taken.
 *     This yields the intersection interval.
 *  2) A pair of inclusive filters:
 *     - 'lessOrEqualThan' for the start field,
 *     - 'greaterOrEqualThan' for the end field.
 *
 * @returns A tuple [startDate, endDate]; values may be undefined if not present.
 */
export const extractIntersectionDateRangeFromFilters = (
    filters: Readonly<BcFilter[]>,
    refinerKeys: { start: string; end: string }
): [string | undefined, string | undefined] => {
    const startRangeFilter = filters.find(f => f.type === FilterType.range && f.fieldName === refinerKeys.start && Array.isArray(f.value))
    const endRangeFilter = filters.find(f => f.type === FilterType.range && f.fieldName === refinerKeys.end && Array.isArray(f.value))

    if (startRangeFilter || endRangeFilter) {
        const start = (startRangeFilter?.value as string[] | undefined)?.[1]
        const end = (endRangeFilter?.value as string[] | undefined)?.[0]
        return [start, end]
    }

    const startFilter = filters.find(f => f.fieldName === refinerKeys.start && f.type === FilterType.lessOrEqualThan)
    const endFilter = filters.find(f => f.fieldName === refinerKeys.end && f.type === FilterType.greaterOrEqualThan)

    const start = startFilter?.value as string | undefined
    const end = endFilter?.value as string | undefined

    return [start, end]
}

const isBoundariesOfDay = (range: [moment.MomentInput, moment.MomentInput], day: moment.MomentInput) => {
    const momentDay = moment(day)
    const [momentStart, momentEnd] = range.map(i => moment(i))

    return momentStart.isSame(momentDay.clone().startOf('day'), 'second') && momentEnd.isSame(momentDay.clone().endOf('day'), 'second')
}
