import React, { useCallback, useState, useEffect, useRef } from 'react'
import { Empty, Icon, Input } from 'antd'
import { SuggestionPickListDataItem } from '@interfaces/data'
import { SuggestionPickListField, SuggestionPickListWidgetMeta } from '@interfaces/widget'
import { shallowEqual, useDispatch } from 'react-redux'
import { createContentList, createDataItemFrom } from './SuggestionPickList.utils'
import Select, { Option } from 'rc-select'
import debounce from 'lodash.debounce'
import cn from 'classnames'
import 'rc-select/assets/index.less'
import styles from './SuggestionPickList.less'
import { BaseFieldProps } from '@cxboxComponents/Field/Field'
import { useAppSelector } from '@store'
import { PendingDataItem } from '@cxbox-ui/core/dist/interfaces'
import { actions } from '@actions'
import { buildBcUrl } from '@utils/buildBcUrl'
import { CxBoxApiInstance } from '../../api'
import { firstValueFrom } from 'rxjs'

type DebounceFunc = ReturnType<typeof debounce>

export interface SuggestionPickListProps extends Omit<BaseFieldProps, 'meta'> {
    meta: SuggestionPickListField
    cursor: string
    widgetName: string
    value: string
}

export function SuggestionPickList({ meta: fieldMeta, widgetName, cursor, value, disabled, placeholder }: SuggestionPickListProps) {
    const { fieldBcUrl, fieldBc, screenName, widget, widgetBcName } = useAppSelector(state => {
        const fieldBcName = fieldMeta.popupBcName
        const fieldBc = state.screen.bo.bc[fieldBcName]
        const limitBySelfCursor = state.router.bcPath?.includes(`${fieldBcName}/${cursor}`)
        const widgetBcName = state.view.widgets.find(item => item.name === widgetName)?.bcName

        return {
            screenName: state.screen.screenName,
            fieldBcUrl: buildBcUrl(fieldBcName, limitBySelfCursor),
            fieldBc,
            widget: state.view.widgets.find(widget => widget.bcName === fieldMeta.popupBcName) as SuggestionPickListWidgetMeta,
            widgetBcName: widgetBcName
        }
    }, shallowEqual)

    const { elements: optionElements, fetchData: fetchOptions, options } = useOptions({ widget })

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
            changeDataAction({
                [fieldMeta.key]: value
            })
        },
        [changeDataAction, fieldMeta.key]
    )

    const changeDataFromObject = useCallback(
        (item?: SuggestionPickListDataItem) => {
            if (fieldMeta.pickMap && item) {
                const restData = createDataItemFrom(fieldMeta.pickMap, item)

                changeDataAction({
                    ...restData
                })
            }
        },
        [changeDataAction, fieldMeta.pickMap]
    )

    const changeData = useCallback(
        (value?: string | SuggestionPickListDataItem | null) => {
            if (typeof value === 'object' && value !== null) {
                changeDataFromObject(value)
            } else if (typeof value === 'string' || value === null) {
                changeDataFromString(value)
            }
        },
        [changeDataFromObject, changeDataFromString]
    )

    const handleSearch = useCallback(
        (query?: string) => {
            fetchOptions.current?.(screenName, fieldBcUrl, {
                query: query ?? '',
                _page: fieldBc.page,
                _limit: widget.limit || fieldBc.limit
            })
        },
        [fetchOptions, fieldBc.limit, fieldBc.page, fieldBcUrl, screenName, widget.limit]
    )

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.currentTarget.value

            changeData(value)

            handleSearch(value)
        },
        [changeData, handleSearch]
    )

    const handleSelect = useCallback(
        (value: string) => {
            const selectedOption = options?.find(option => option.id === value)
            const searchValueKey = fieldMeta.pickMap[fieldMeta.key]

            if (!searchValueKey) {
                console.error('pickMap does not have a search field')
            }

            changeData(selectedOption)

            handleSearch(selectedOption?.[searchValueKey])
        },
        [changeData, fieldMeta.key, fieldMeta.pickMap, handleSearch, options]
    )

    const handleClear = useCallback(() => {
        changeData(null)
    }, [changeData])

    return (
        <Select
            style={{ width: '100%' }}
            dropdownClassName={styles.dropdown}
            mode="combobox"
            defaultActiveFirstOption={false}
            value={value}
            getInputElement={() => (
                <div className={cn(styles.inputWrapper, { [styles.filled]: value?.length })}>
                    <Input value={value} onChange={handleInputChange} placeholder={placeholder} disabled={disabled} />
                    <span className={styles.clear} onClick={handleClear}>
                        <Icon type="close-circle" theme="filled" />
                    </span>
                    <span className={styles.arrow}>
                        <Icon type="down" />
                    </span>
                </div>
            )}
            notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            onSelect={handleSelect}
            filterOption={false}
            disabled={disabled}
        >
            {optionElements}
        </Select>
    )
}

export default SuggestionPickList

const MIN_SEARCH_VALUE_LENGTH = 1

function useOptions({ widget }: { widget: SuggestionPickListWidgetMeta }) {
    const [options, setOptions] = useState<SuggestionPickListDataItem[] | undefined>()

    const elements = options?.map(option => {
        const contentList = createContentList(widget, option)

        return (
            <Option key={option.id}>
                <div className={styles.option}>
                    {contentList?.map(text => (
                        <span key={text}>{text}</span>
                    ))}
                </div>
            </Option>
        )
    })

    const fetchDataDebouncedRef = useRef<DebounceFunc>()

    useEffect(() => {
        fetchDataDebouncedRef.current = debounce(
            (screenName: string, fieldBcUrl: string, params: { query: string; _page: number; _limit: number }) => {
                if (params.query?.length >= MIN_SEARCH_VALUE_LENGTH) {
                    firstValueFrom(CxBoxApiInstance.fetchBcData(screenName, fieldBcUrl, params)).then(response => {
                        const data = response.data as unknown as SuggestionPickListDataItem[]

                        setOptions(data)
                    })
                }
            },
            500
        )
    }, [])

    return {
        options,
        elements,
        fetchData: fetchDataDebouncedRef
    }
}
