import moment from 'moment/moment'
import { FieldType } from '@cxbox-ui/core'

export const dateFormat = moment.ISO_8601
export const enum DateFormat {
    outputMonthYearFormat = 'MMMM YYYY',
    outputDateFormat = 'DD.MM.YYYY',
    outputDateTimeFormat = 'DD.MM.YYYY HH:mm',
    outputDateTimeWithSecondsFormat = 'DD.MM.YYYY HH:mm:ss'
}

export type DateFieldTypes = FieldType.date | FieldType.dateTime | FieldType.dateTimeWithSeconds
