/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Decides what control will be used for specific field type
 */

import React from 'react'
import { Checkbox, DatePicker, Icon, Input } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import moment, { Moment } from 'moment'
import RangePicker from './components/RangePicker'
import { WidgetListField, WidgetMeta } from '@cxbox-ui/core'
import { RowMetaField } from '@cxbox-ui/core'
import { DataValue } from '@cxbox-ui/schema'
import { FieldType } from '@cxbox-ui/core'
import { CheckboxFilter } from '@teslerComponents/ui/CheckboxFilter/CheckboxFilter'
import { getFormat } from '@teslerComponents/ui/DatePickerField/DatePickerField'
import { FrownOutlined } from '@ant-design/icons'

export interface ColumnFilterControlProps {
    widgetFieldMeta: WidgetListField
    rowFieldMeta: RowMetaField
    value: DataValue | DataValue[]
    onChange: (value: DataValue | DataValue[]) => void
    widgetOptions?: WidgetMeta['options']
}

/**
 *
 * @param props
 * @category Components
 */
export const ColumnFilterControl: React.FC<ColumnFilterControlProps> = props => {
    switch (props.widgetFieldMeta.type) {
        case FieldType.dictionary:
        case FieldType.pickList: {
            return (
                <CheckboxFilter
                    title={props.widgetFieldMeta.title}
                    value={props.value as DataValue[]}
                    filterValues={props.rowFieldMeta.filterValues}
                    onChange={props.onChange}
                />
            )
        }
        case FieldType.checkbox: {
            return (
                <Checkbox
                    onChange={(e: CheckboxChangeEvent) => {
                        props.onChange(e.target.checked)
                    }}
                />
            )
        }
        case FieldType.dateTimeWithSeconds:
            if (props.widgetOptions?.filterDateByRange) {
                return (
                    <RangePicker
                        value={props.value as DataValue[]}
                        onChange={v => props.onChange(v)}
                        format={getFormat(false, true)}
                        showTime={{ format: 'HH:mm:ss' }}
                    />
                )
            }
            return (
                <DatePicker
                    autoFocus
                    onChange={(date: Moment, dateString: string) => {
                        props.onChange(date?.toISOString())
                    }}
                    value={props.value ? moment(props.value as string, moment.ISO_8601) : null}
                    format={getFormat()}
                />
            )

        case FieldType.dateTime:
            if (props.widgetOptions?.filterDateByRange) {
                return (
                    <RangePicker
                        value={props.value as DataValue[]}
                        onChange={v => props.onChange(v)}
                        format={getFormat(true)}
                        showTime={{ format: 'HH:mm' }}
                    />
                )
            }
            return (
                <DatePicker
                    autoFocus
                    onChange={(date: Moment, dateString: string) => {
                        props.onChange(date?.toISOString())
                    }}
                    value={props.value ? moment(props.value as string, moment.ISO_8601) : null}
                    format={getFormat()}
                />
            )

        case FieldType.date: {
            if (props.widgetOptions?.filterDateByRange) {
                return (
                    <RangePicker
                        value={props.value as DataValue[]}
                        onChange={v => props.onChange(v)}
                        format={getFormat()}
                        dateOnly={true}
                    />
                )
            }
            return (
                <DatePicker
                    autoFocus
                    onChange={(date: Moment, dateString: string) => {
                        props.onChange(date?.toISOString())
                    }}
                    value={props.value ? moment(props.value as string, moment.ISO_8601) : null}
                    format={getFormat()}
                />
            )
        }
        case FieldType.input:
        case FieldType.text:
        case FieldType.number:
        default: {
            return (
                <Input
                    autoFocus
                    value={props.value as string}
                    suffix={<FrownOutlined />}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const textValue = e.target.value.substr(0, 100)
                        props.onChange(textValue || null)
                    }}
                />
            )
        }
    }
}

/**
 * @category Components
 */
const MemoizedColumnFilterControl = React.memo(ColumnFilterControl)

export default MemoizedColumnFilterControl
