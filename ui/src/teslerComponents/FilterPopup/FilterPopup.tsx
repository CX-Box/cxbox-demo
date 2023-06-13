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
 * Opens when column filter requested
 */

import React, { FormEvent } from 'react'
import { Button, Form } from 'antd'
import styles from './FilterPopup.less'
import { useDispatch, useSelector } from 'react-redux'
import { Store } from '@interfaces/store'
import { useTranslation } from 'react-i18next'
import { DataValue, FieldType } from '@cxbox-ui/schema'
import { WidgetField } from '@cxbox-ui/core'
import { BcFilter, FilterType } from '@cxbox-ui/core'
import { getFilterType } from '@cxbox-ui/core'
import { $do } from '@actions/types'

export interface FilterPopupProps {
    widgetName: string
    fieldKey: string
    value: DataValue | DataValue[]
    children: React.ReactNode
    fieldType?: FieldType
    onApply?: () => void
    onCancel?: () => void
}

/**
 *
 * @param props
 * @category Components
 */
export const FilterPopup: React.FC<FilterPopupProps> = props => {
    const widget = useSelector((store: Store) => {
        return store.view.widgets.find(item => item.name === props.widgetName)
    })
    const viewName = useSelector((store: Store) => {
        return store.view.name
    })
    const filter = useSelector((store: Store) => {
        return store.screen.filters[widget?.bcName]?.find(item => item.fieldName === props.fieldKey)
    })
    const widgetMeta = (widget?.fields as WidgetField[])?.find(item => item.key === props.fieldKey)
    const dispatch = useDispatch()
    const { t } = useTranslation()
    if (!widgetMeta) {
        return null
    }
    const handleApply = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newFilter: BcFilter = {
            type:
                widget.options?.filterDateByRange &&
                [FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(props.fieldType)
                    ? FilterType.range
                    : getFilterType(widgetMeta.type),
            value: props.value,
            fieldName: props.fieldKey,
            viewName,
            widgetName: widget.name
        }
        if (props.value === null || props.value === undefined) {
            dispatch($do.bcRemoveFilter({ bcName: widget.bcName, filter }))
        } else {
            dispatch($do.bcAddFilter({ bcName: widget.bcName, filter: newFilter, widgetName: widget.name }))
        }
        // FullHierarchy has its own implementation of data search without backend query filtered data
        if (!widget.options?.hierarchyFull) {
            dispatch($do.bcForceUpdate({ bcName: widget.bcName }))
        }
        props.onApply?.()
    }

    const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        if (filter) {
            dispatch($do.bcRemoveFilter({ bcName: widget.bcName, filter }))
            if (!widget.options?.hierarchyFull) {
                dispatch($do.bcForceUpdate({ bcName: widget.bcName }))
            }
        }
        props.onCancel?.()
    }

    return (
        <Form onSubmit={handleApply} layout="vertical">
            {props.children}
            <div className={styles.operators}>
                <Button className={styles.button} htmlType="submit">
                    {t('Apply')}
                </Button>
                <Button className={styles.button} onClick={handleCancel}>
                    {t('Clear')}
                </Button>
            </div>
        </Form>
    )
}

/**
 * @category Components
 */
export default React.memo(FilterPopup)
