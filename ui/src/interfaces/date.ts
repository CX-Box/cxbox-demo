import { interfaces } from '@cxbox-ui/core'
import moment from 'moment/moment'

export const dateFormat = moment.ISO_8601
export const enum DateFormat {
    outputMonthYearFormat = 'MMMM YYYY',
    outputDateFormat = 'DD.MM.YYYY',
    outputDateTimeFormat = 'DD.MM.YYYY HH:mm',
    outputDateTimeWithSecondsFormat = 'DD.MM.YYYY HH:mm:ss'
}

export type DateFieldTypes = interfaces.FieldType.date | interfaces.FieldType.dateTime | interfaces.FieldType.dateTimeWithSeconds
