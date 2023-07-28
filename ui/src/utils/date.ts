import moment from 'moment'
import { FieldType } from '@cxbox-ui/core/interfaces/view'
import { dateFormat, DateFormat } from '../interfaces/date'

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

export const isDateField = (type: string) => {
    return [FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(type as FieldType)
}
