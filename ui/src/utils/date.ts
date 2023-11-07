import moment from 'moment'
import { dateFormat, DateFormat } from '@interfaces/date'
import { interfaces } from '@cxbox-ui/core'

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

export const convertDate = (date: string | null, withTime?: boolean, withSeconds?: boolean, monthYear?: boolean): string => {
    if (monthYear) {
        moment.locale('ru')
    }

    if (!date) {
        return ''
    }

    return moment(date, dateFormat).format(getFormat(withTime, withSeconds, monthYear))
}

const { FieldType } = interfaces
export const isDateField = (type: string) => {
    return [FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(type as interfaces.FieldType)
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
