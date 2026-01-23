import { BcFilter, FilterType } from '@cxbox-ui/core'
import { getAverageDate, isoLocalFormatter } from '@utils/date'
import moment, { MomentInput } from 'moment/moment'
import { unitOfTime } from 'moment'
import { CustomFieldTypes } from '@interfaces/widget'
import { FieldType } from '@cxbox-ui/schema'

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

export const getFirstDay = () => {
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
 * @param granularity
 */
export const isAllDayOrMultiDay = (
    range: [moment.MomentInput, moment.MomentInput],
    granularity: Extract<unitOfTime.StartOf, 'second' | 'minute' | 'day'> = 'second'
) => {
    const momentStart = moment(range[0])
    const momentEnd = moment(range[1])

    if (!momentStart.isValid() || !momentEnd.isValid()) {
        return false
    }

    const isOneAllDay = isBoundariesOfDay([momentStart, momentEnd], momentStart, granularity) // с 00:00:00 до 23:59:59

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

export const isBoundariesOfDay = (
    range: [moment.MomentInput, moment.MomentInput],
    day?: moment.MomentInput,
    granularity: Extract<unitOfTime.StartOf, 'second' | 'minute' | 'day'> = 'second'
) => {
    const [boundaryStart, boundaryEnd] = range.map(i => moment(i))

    if (!boundaryStart.isValid() || !boundaryEnd.isValid()) {
        return false
    }

    const targetDay = moment(day ?? boundaryStart)

    if (!targetDay.isValid() || (!day && !boundaryStart.isSame(boundaryEnd, 'day'))) {
        return false
    }

    const dayStart = targetDay.clone().startOf('day')
    const dayEnd = targetDay.clone().endOf('day')

    return boundaryStart.isSame(dayStart, granularity) && boundaryEnd.isSame(dayEnd, granularity)
}

export const getEventTimeGranularity = (
    types: (CustomFieldTypes | FieldType)[]
): Extract<unitOfTime.StartOf, 'second' | 'minute' | 'day'> => {
    const allDateTypes = new Set(types)

    if (allDateTypes.has(FieldType.dateTimeWithSeconds)) {
        return 'second'
    } else if (allDateTypes.has(FieldType.dateTime)) {
        return 'minute'
    } else {
        return 'day'
    }
}

type CalendarGridValidationResult = { ok: true } | { ok: false; reason: string }

export const isRangeValid = (startInput: MomentInput, endInput: MomentInput): CalendarGridValidationResult => {
    const start = moment(startInput)
    const end = moment(endInput)

    if (!start.isValid()) {
        return { ok: false, reason: 'Invalid start date' }
    }

    if (!end.isValid()) {
        return { ok: false, reason: 'Invalid end date' }
    }

    if (start.isAfter(end)) {
        return { ok: false, reason: 'Start date is after end date' }
    }

    return { ok: true }
}

export const isCalendarMonthGridRangeValid = (
    startInput: MomentInput,
    endInput: MomentInput,
    granularity: Extract<unitOfTime.StartOf, 'second' | 'minute' | 'day'> = 'second'
): CalendarGridValidationResult => {
    const base = isRangeValid(startInput, endInput)

    if (!base.ok) {
        return base
    }

    const start = moment(startInput)
    const end = moment(endInput)

    const avg = getAverageDate(startInput, endInput)
    const gridStartExpected = getFirstDayOfMonthGrid(avg)
    const gridEndExpected = getLastDayOfMonthGrid(avg)

    if (!start.isSame(gridStartExpected, granularity)) {
        return { ok: false, reason: 'Start boundary does not match calendar grid start' }
    }

    if (!end.isSame(gridEndExpected, granularity)) {
        return { ok: false, reason: 'End boundary does not match calendar grid end' }
    }

    return { ok: true }
}

export const isCalendarYearGridRangeValid = (
    startInput: MomentInput,
    endInput: MomentInput,
    granularity: Extract<unitOfTime.StartOf, 'second' | 'minute' | 'day'> = 'second'
): CalendarGridValidationResult => {
    const base = isRangeValid(startInput, endInput)

    if (!base.ok) {
        return base
    }

    const start = moment(startInput)
    const end = moment(endInput)

    if (!start.isSame(end, 'year')) {
        return { ok: false, reason: 'Start and end dates must be within the same year' }
    }

    const gridStartExpected = getFirstDayOfYear(start)
    const gridEndExpected = getLastDayOfYear(end)

    if (!start.isSame(gridStartExpected, granularity)) {
        return { ok: false, reason: 'Start date must be the exact beginning of the year' }
    }

    if (!end.isSame(gridEndExpected, granularity)) {
        return { ok: false, reason: 'End date must be the exact end of the year' }
    }

    return { ok: true }
}

export const isCalendarYearEventRangeValid = (
    startInput: MomentInput,
    endInput: MomentInput,
    granularity: Extract<unitOfTime.StartOf, 'second' | 'minute' | 'day'> = 'second'
): CalendarGridValidationResult => {
    const base = isRangeValid(startInput, endInput)

    if (!base.ok) {
        return base
    }

    if (!isBoundariesOfDay([startInput, endInput], undefined, granularity)) {
        return { ok: false, reason: 'Dates are not the boundaries of the day' }
    }

    return { ok: true }
}
