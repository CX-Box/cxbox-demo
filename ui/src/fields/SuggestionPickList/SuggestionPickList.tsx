import React, { useCallback, useState } from 'react'
import Select from 'rc-select'
import { Empty, Icon, Input, Spin } from 'antd'
import { shallowEqual, useDispatch } from 'react-redux'
import cn from 'classnames'
import ReadOnlyField from '../../components/ui/ReadOnlyField/ReadOnlyField'
import { useOptions } from './hooks/useOptions'
import { createDataItemFrom } from './utils'
import { BaseFieldProps } from '@components/Field/Field'
import { useAppSelector } from '@store'
import { actions } from '@actions'
import { buildBcUrl } from '@utils/buildBcUrl'
import { PendingDataItem } from '@cxbox-ui/core'
import { SuggestionPickListDataItem } from '@interfaces/data'
import { SuggestionPickListField, SuggestionPickListWidgetMeta } from '@interfaces/widget'
import { WidgetFieldBase } from '@cxbox-ui/schema'
import 'rc-select/assets/index.less'
import styles from './SuggestionPickList.module.less'

export interface SuggestionPickListProps extends Omit<BaseFieldProps, 'meta'> {
    meta: SuggestionPickListField
    cursor: string
    widgetName: string
    value: string
}

export function SuggestionPickList({
    meta: fieldMeta,
    widgetName,
    cursor,
    value: externalValue,
    disabled,
    placeholder,
    readOnly,
    onDrillDown,
    className,
    backgroundColor
}: SuggestionPickListProps) {
    const { fieldBcUrl, screenName, widget, widgetBcName, fieldBc } = useAppSelector(state => {
        const fieldBcName = fieldMeta.popupBcName
        const limitBySelfCursor = state.router.bcPath?.includes(`${fieldBcName}/${cursor}`)
        const widgetBcName = state.view.widgets.find(item => item.name === widgetName)?.bcName

        return {
            screenName: state.screen.screenName,
            fieldBcUrl: buildBcUrl(fieldBcName, limitBySelfCursor),
            fieldBc: fieldMeta.popupBcName ? state.screen.bo.bc[fieldMeta.popupBcName] : undefined,
            widget: state.view.widgets.find(widget => widget.bcName === fieldMeta.popupBcName) as SuggestionPickListWidgetMeta,
            widgetBcName: widgetBcName
        }
    }, shallowEqual)

    const { elements: optionElements, fetchData: fetchOptions, options, isLoading } = useOptions({ widget })

    const [localValue, setLocalValue] = useState<string | null>(null)

    const currentValue = localValue !== null ? localValue : externalValue

    const dispatch = useDispatch()

    const changeDataAction = useCallback(
        (item: PendingDataItem) => {
            if (widgetBcName) {
                dispatch(
                    actions.changeDataItem({
                        bcName: widgetBcName,
                        cursor,
                        dataItem: item,
                        bcUrl: buildBcUrl(widgetBcName, true)
                    })
                )
            }
        },
        [cursor, dispatch, widgetBcName]
    )

    const changeDataFromString = useCallback(
        (value: string | null) => {
            setLocalValue(null)

            changeDataAction({
                [fieldMeta.key]: value
            })
        },
        [changeDataAction, fieldMeta.key]
    )

    const changeDataFromObject = useCallback(
        (item?: SuggestionPickListDataItem) => {
            if (fieldMeta.pickMap && item) {
                setLocalValue(null)

                const restData = createDataItemFrom(fieldMeta.pickMap, item)

                changeDataAction({
                    ...restData
                })
            }
        },
        [changeDataAction, fieldMeta.pickMap]
    )

    const clearData = useCallback(() => {
        changeDataFromString(null)
    }, [changeDataFromString])

    const changeData = useCallback(
        (value?: string | SuggestionPickListDataItem | null) => {
            if (typeof value === 'object' && value !== null) {
                changeDataFromObject(value)
            } else if (typeof value === 'string') {
                changeDataFromString(value)
            } else if (value === null) {
                clearData()
            }
        },
        [changeDataFromObject, changeDataFromString, clearData]
    )

    const searchData = useCallback(
        (query?: string) => {
            fetchOptions.current?.(screenName, fieldBcUrl, {
                query: query ?? '',
                _page: fieldBc?.page,
                _limit: widget.limit || fieldBc?.limit
            })
        },
        [fetchOptions, fieldBc, fieldBcUrl, screenName, widget.limit]
    )

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.currentTarget.value

            setLocalValue(value)

            searchData(value)
        },
        [searchData]
    )

    const handleBlur = React.useCallback(() => {
        if (localValue != null) {
            changeDataFromString(localValue)
        }
    }, [localValue, changeDataFromString])

    const handleSelect = useCallback(
        (value: string) => {
            const selectedOption = options?.find(option => option.id === value)
            const searchValueKey = fieldMeta.pickMap[fieldMeta.key]

            if (!searchValueKey) {
                console.error('pickMap does not have a search field')
            }

            changeData(selectedOption)

            searchData(selectedOption?.[searchValueKey])
        },
        [changeData, fieldMeta.key, fieldMeta.pickMap, searchData, options]
    )

    const handleFocus = useCallback(() => {
        searchData(currentValue)
    }, [currentValue, searchData])

    if (readOnly) {
        return (
            <ReadOnlyField
                widgetName={widgetName}
                meta={fieldMeta as unknown as WidgetFieldBase}
                className={className}
                backgroundColor={backgroundColor}
                cursor={cursor}
                onDrillDown={onDrillDown}
            >
                {currentValue}
            </ReadOnlyField>
        )
    }

    return (
        <Select
            className={styles.container}
            dropdownClassName={styles.dropdown}
            style={{ width: '100%' }}
            mode="combobox"
            virtual={false}
            defaultActiveFirstOption={false}
            value={currentValue}
            getInputElement={() => (
                <div className={cn(styles.inputWrapper, { [styles.filled]: !disabled && currentValue?.length })}>
                    <Input value={currentValue} onChange={handleChange} placeholder={placeholder} disabled={disabled} />

                    <span className={styles.clear} onClick={clearData}>
                        <Icon type="close-circle" theme="filled" />
                    </span>

                    <span className={styles.arrow}>
                        <Icon type="down" />
                    </span>
                </div>
            )}
            notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            dropdownRender={menu => (
                <Spin className={styles.spinner} spinning={isLoading}>
                    {menu}
                </Spin>
            )}
            onSelect={handleSelect}
            onFocus={handleFocus}
            onBlur={handleBlur}
            filterOption={false}
            disabled={disabled}
        >
            {optionElements}
        </Select>
    )
}

export default SuggestionPickList
