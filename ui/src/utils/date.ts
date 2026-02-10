import moment, { Moment } from 'moment'
import { dateFormat, DateFormat } from '@interfaces/date'
import { FieldType, interfaces } from '@cxbox-ui/core'
import { dateFieldTypes } from '@constants/field'

export const isoLocalFormatter = (date?: Moment | null) => date?.format('YYYY-MM-DD[T]HH:mm:ss')

export const getFormat = (showTime?: boolean, showSeconds?: boolean, monthYear?: boolean) => {
    if (showSeconds) {
        return DateFormat.outputDateTimeWithSecondsFormat
    } else if (showTime) {
        return DateFormat.outputDateTimeFormat
    } else if (monthYear) {
        return DateFormat.outputMonthYearFormat
    } else {
        return DateFormat.outputDateFormat
    }
}

export const toYMD = (date?: moment.MomentInput): string | undefined => {
    const momentDate = moment(date)

    if (momentDate.isValid()) {
        return momentDate.format('YYYY-MM-DD')
    }

    return undefined
}

export const toYM = (date?: moment.MomentInput): string | undefined => {
    const momentDate = moment(date)

    if (momentDate.isValid()) {
        return momentDate.format('YYYY-MM')
    }

    return undefined
}

export const convertDate = (date: string | null, withTime?: boolean, withSeconds?: boolean, monthYear?: boolean): string => {
    if (monthYear) {
        moment.locale('ru')
    }

    if (!date) {
        return ''
    }

    return moment(date, dateFormat).format(getFormat(withTime, withSeconds, monthYear))
}

export const getAverageDate = (startDate: moment.MomentInput, endDate: moment.MomentInput) => {
    const startTimestamp = moment(startDate).valueOf()
    const endTimestamp = moment(endDate).valueOf()

    const avgTimestamp = (startTimestamp + endTimestamp) / 2

    return moment(avgTimestamp)
}

export const isDateField = (type: string) => {
    return dateFieldTypes.includes(type as interfaces.FieldType)
}

export type DateTypes = typeof FieldType.date | typeof FieldType.dateTime | typeof FieldType.dateTimeWithSeconds

export const getCurrentDate = (d: Date = new Date(), del: string = '-') => {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return dd + del + mm + del + yyyy
}

export const getFormattedDateString = (dateString: string, dateType: DateTypes, isUTC: boolean) => {
    const localMoment = isUTC ? moment.utc(dateString).local() : moment(dateString)
    switch (dateType) {
        case FieldType.dateTime: {
            return localMoment.format('DD.MM.YYYY HH:mm')
        }
        case FieldType.dateTimeWithSeconds: {
            return localMoment.format('DD.MM.YYYY HH:mm:ss')
        }
        case FieldType.date: {
            return moment(dateString).format('DD.MM.YYYY')
        }
    }
}

export const dayChanged = (currentDate: moment.MomentInput, newDate: moment.MomentInput) => {
    return toYMD(currentDate) !== toYMD(newDate)
}

export const monthChanged = (currentDate: moment.MomentInput, newDate: moment.MomentInput) => {
    return toYM(currentDate) !== toYM(newDate)
}

export const yearChanged = (currentDate: moment.MomentInput, newDate: moment.MomentInput) => {
    return moment(currentDate).format('YYYY') !== moment(newDate).format('YYYY')
}
