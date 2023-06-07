import React, { useCallback, useState, useEffect } from 'react'
import { Select } from 'antd'
import { SuggestionPickListDataItem } from '../../interfaces/data'
import styles from './SuggestionPickList.module.css'
import cn from 'classnames'
import { SuggestionPickListField, SuggestionPickListWidgetMeta } from '../../interfaces/widget'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { $do } from '../../actions/types'
import { AppState } from '../../interfaces/storeSlices'
import { buildBcUrl, fetchBcData, useDebounce } from '@cxbox-ui/core'
import { Observable } from 'rxjs/Observable'

export interface SuggestionPickListProps {
    meta: SuggestionPickListField
    cursor: string
    widgetName: string
    value: string
}

/**
 * A field similar to Select with a search.
 * Field type: suggestionPickList.
 * The meta of the field is identical to the meta of the pickList field.
 *
 * PopupBcName is a property from the meta, an endpoint for searching for matching values.
 * The local options is formed based on its response. Every object in options,
 * must have value and id.
 *
 * pickMap is a property of the meta field which is used to populate other fields. The data is taken from the options.
 *
 * key is the property of the meta that is the key of the meta. Value for this field will be taken from the value property, which is contained in the option.
 *
 * So for the field you must create a widget with SuggestionPickList type and bc corresponding popupBcName of our field.
 * The fields of this widget will be used to render the option in the drop-down list.
 * The widget must be specified in the meta for the view.
 *
 *
 * @param fieldMeta
 * @param widgetName
 * @param cursor
 * @constructor
 */
export function SuggestionPickList({ meta: fieldMeta, widgetName, cursor }: SuggestionPickListProps) {
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState<SuggestionPickListDataItem[]>()
    const [valid, setValid] = useState<boolean | undefined>()

    const { fieldBcUrl, fieldBc, screenName, fieldWidget, widgetBcName, record } = useSelector((state: AppState) => {
        const fieldBcName = fieldMeta.popupBcName
        const fieldBc = state.screen.bo.bc[fieldBcName]
        const limitBySelfCursor = state.router.bcPath?.includes(`${fieldBcName}/${cursor}`)
        const widgetBcName = state.view.widgets.find(item => item.name === widgetName)?.bcName

        return {
            screenName: state.screen.screenName,
            fieldBcUrl: buildBcUrl(fieldBcName, limitBySelfCursor),
            fieldBc,
            fieldWidget: state.view.widgets.find(widget => widget.bcName === fieldMeta.popupBcName) as SuggestionPickListWidgetMeta,
            widgetBcName: widgetBcName,
            record: state.view.pendingDataChanges[widgetBcName!]?.[cursor] ?? state.data[widgetBcName!]?.find(item => item.id === cursor)
        }
    }, shallowEqual)

    const preselectedValue = record?.[fieldMeta.key] as string

    const debouncedSearch = useDebounce(search, 500)

    useEffect(() => {
        if (debouncedSearch) {
            const fetchParams: Record<string, any> = {
                query: debouncedSearch,
                _page: fieldBc.page,
                _limit: fieldWidget.limit || fieldBc.limit
            }

            fetchBcData(screenName, fieldBcUrl, fetchParams)
                .map(response => {
                    setOptions(response.data as unknown as SuggestionPickListDataItem[])

                    return Observable.empty()
                })
                .subscribe()
        }
    }, [fieldBc.limit, fieldBc.page, fieldBcUrl, debouncedSearch, fieldMeta.popupBcName, screenName, fieldWidget.limit])

    const dispatch = useDispatch()

    const handleSearch = useCallback((token: string) => {
        setSearch(token)
    }, [])

    const handleValidation = useCallback(() => {
        if (!preselectedValue) {
            setValid(false)
            setSearch('')
        } else {
            setValid(true)
        }
    }, [preselectedValue])

    const handleChange = useCallback(
        (id: string) => {
            const selectedOption = options?.find(item => item?.id === id)!

            setValid(!!selectedOption)
            if (widgetBcName) {
                const restData = fieldMeta.pickMap && selectedOption ? createDataItemFrom(fieldMeta.pickMap, selectedOption) : {}

                dispatch(
                    $do.changeDataItem({
                        bcName: widgetBcName,
                        cursor,
                        dataItem: {
                            [fieldMeta.key]: selectedOption?.value,
                            ...restData
                        }
                    })
                )
            }
        },
        [cursor, dispatch, fieldMeta.key, fieldMeta.pickMap, options, widgetBcName]
    )

    return (
        <div className={styles.container}>
            <Select
                showSearch
                optionLabelProp="label"
                defaultValue={preselectedValue}
                allowClear
                filterOption={false}
                onSearch={handleSearch}
                className={cn({ [styles.good]: valid === true, [styles.bad]: valid === false })}
                onChange={handleChange}
                onBlur={handleValidation}
                defaultActiveFirstOption={false}
            >
                {options?.map(option => {
                    const contentList = createContentList(fieldWidget, option)

                    return (
                        <Select.Option key={option.id} value={option.id} label={option.value} className={styles.option}>
                            <div className={styles.item}>
                                {contentList?.map(text => (
                                    <span key={text}>{text}</span>
                                ))}
                            </div>
                        </Select.Option>
                    )
                })}
            </Select>
            {valid === false && <div className={styles.error}>Select a value from the dropdown list</div>}
        </div>
    )
}

export default SuggestionPickList

function createDataItemFrom(pickMap: Record<string, string>, data: SuggestionPickListDataItem['data']) {
    return Object.entries(pickMap).reduce((acc: Record<string, any>, [proposalNewKey, proposalOldKey]) => {
        acc[proposalNewKey] = data[proposalOldKey]

        return acc
    }, {})
}

function createContentList(fieldWidget: SuggestionPickListWidgetMeta, option: SuggestionPickListDataItem) {
    return fieldWidget?.fields?.map(field => {
        const label = field.title ? `${field.title}: ` : ''
        const value = option[field.key]

        return `${label}${value}`
    })
}
