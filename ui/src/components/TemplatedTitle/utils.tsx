import { DataItem, DataValue, WidgetField, WidgetFieldBase } from '@cxbox-ui/schema'
import React, { ReactNode } from 'react'
import styles from './TemplatedTitle.less'
import cn from 'classnames'
import moment from 'moment'
import { getFormat as getDateFormat } from '@utils/date'
import { FieldType } from '@cxbox-ui/core'
import { NumberInputFormat } from '@cxboxComponents/ui/NumberInput/formaters'
import { DateFieldMeta, DateTimeFieldMeta, DateTimeWithSecondsFieldMeta } from '@cxbox-ui/core'
import { ITimePickerFieldMeta } from '../../fields/TimePicker/TimePickerField'
import { AppNumberFieldMeta, CustomFieldTypes } from '@interfaces/widget'

// Token format: '${fieldName:defaultValue}'
const TAG_PLACEHOLDER_VALUE = /\${([^{}]+)}/
const TAG_PLACEHOLDER_FULL = /(\${[^{}]+})/g

function getFieldMeta<T extends WidgetFieldBase>(key: string, fields?: T[]) {
    return fields?.find(field => field.key === key)
}

export function normalizeFieldValue(value: DataValue | undefined, fieldMeta?: WidgetField) {
    if (Array.isArray(value)) {
        return Array.isArray(value) ? value.map(item => item.value).join(', ') : undefined
    }

    const dateFieldMeta = fieldMeta as DateFieldMeta | DateTimeWithSecondsFieldMeta | DateTimeFieldMeta
    const isDateField = [FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(dateFieldMeta?.type)
    if (isDateField) {
        return value
            ? moment(value as moment.MomentInput, moment.ISO_8601)?.format(
                  getDateFormat(dateFieldMeta?.type === FieldType.dateTime, dateFieldMeta?.type === FieldType.dateTimeWithSeconds, false)
              )
            : null
    }

    const { type, digits, nullable, currency } = (fieldMeta as AppNumberFieldMeta) || {}

    const isNumberField = [FieldType.number, FieldType.money, FieldType.percent].includes(type)
    if (isNumberField) {
        return NumberInputFormat[type](value as number, digits, nullable) + (type === FieldType.money && currency ? ` ${currency}` : '')
    }

    const timeFieldMeta = fieldMeta as ITimePickerFieldMeta
    const isTimeField = (timeFieldMeta?.type as string) === CustomFieldTypes.Time
    if (isTimeField) {
        return moment.parseZone(value as string | null)?.format(timeFieldMeta.format ?? 'HH:mm:ss')
    }

    return value
}

/**
 * Replaces tokens in a template string with object field values.
 *
 * Example:
 * const item = { color1: 'Green', color2: 'Blue' }
 * const templatedString = 'Color is ${color1} ${color2:Purple} ${color3:Purple}'
 * format(templateString, item) // => 'Green Blue Purple'
 *
 * @param templatedString Patterned string
 * @param item An object in the fields of which tokens should be searched
 * @param fields
 */
const convertTemplatedString = (templatedString: string, item: DataItem | undefined, fields?: WidgetField[]): ReactNode => {
    if (!templatedString) {
        return ''
    }

    // If the regular expression contains capturing parentheses, then each time separator is matched the results (including any undefined results) of the capturing parentheses are spliced into the output array.
    return (
        <span>
            {templatedString.split(TAG_PLACEHOLDER_FULL).reduce<ReactNode[]>((acc, str, index) => {
                const value = str.match(TAG_PLACEHOLDER_VALUE)

                if (value !== null) {
                    const [key, defaultValue] = value[1].split(':')
                    const field = getFieldMeta(key, fields)
                    const staticBgColor = field?.bgColor
                    const bgColorKey = field?.bgColorKey
                    const dynamicBgColor = bgColorKey ? (item?.[bgColorKey] as string) : undefined
                    const normalizedValue = String(normalizeFieldValue(item?.[key], field) || defaultValue || '')
                    const bgColor = dynamicBgColor || staticBgColor

                    acc.push(
                        bgColor ? (
                            <span
                                key={index}
                                className={cn({ [styles.tag]: bgColor })}
                                style={{ display: 'inline-block', backgroundColor: bgColor }}
                            >
                                {normalizedValue}
                            </span>
                        ) : (
                            normalizedValue
                        )
                    )
                } else if (str?.length) {
                    acc.push(str)
                }

                return acc
            }, [])}
        </span>
    )
}

const isTemplate = (templatedString: string): boolean => {
    if (!templatedString) {
        return false
    }

    return templatedString.match(TAG_PLACEHOLDER_FULL) !== null
}

export function getWidgetTitle(str: string, record?: DataItem, fields?: WidgetField[]) {
    if (isTemplate(str)) {
        return convertTemplatedString(str, record, fields)
    } else {
        return <span>{str}</span>
    }
}
