import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './TextSearchInput.less'
import { actions } from '@actions'
import { useDispatch } from 'react-redux'
import { useDebouncedTextSearch, useSearchWarning } from '@hooks/search'
import SearchInput from '../SearchInput/SearchInput'
import { useTranslation } from 'react-i18next'
import { Icon, Popover } from 'antd'
import { useAppSelector } from '@store'
import { FilterType } from '@interfaces/filters'
import { FilterType as CoreFilterType } from '@interfaces/core'

const FULL_TEXT_SEARCH = FilterType.fullTextSearch as CoreFilterType

interface TextSearchInputProps {
    bcName: string
    placeholder?: string
    widgetName: string
}

const TextSearchInput = ({ widgetName, bcName, placeholder }: TextSearchInputProps) => {
    const { changeValue, value } = useSearchSynchronizedWithFilter(widgetName, bcName)

    const handleInputValue = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            changeValue(e.target.value)
        },
        [changeValue]
    )

    const { t } = useTranslation()

    const showWarning = useSearchWarning(value as string)

    return (
        <Popover
            visible={showWarning}
            placement="bottomLeft"
            content={
                <span>
                    <Icon type="warning" style={{ marginRight: 4 }} />
                    {t('Enter three or more characters')}
                </span>
            }
        >
            <SearchInput value={value as string} onChange={handleInputValue} className={styles.container} placeholder={placeholder} />
        </Popover>
    )
}

export default React.memo(TextSearchInput)

// to avoid calling unnecessary effects
export const useActualValue = <T extends unknown>(value: T) => {
    const actualValue = useRef<T>(value)

    useEffect(() => {
        actualValue.current = value
    }, [value])

    return actualValue
}

export const useSearchSynchronizedWithFilter = (widgetName: string, bcName: string) => {
    const externalFilterValue = useAppSelector(state => state.screen.filters[bcName]?.find(item => item.type === FULL_TEXT_SEARCH))
        ?.value as string | undefined
    const [value, setValue] = useState<string | null | undefined>(externalFilterValue)
    const valueRef = useActualValue(value)
    const externalFilterValueRef = useActualValue(externalFilterValue)

    // synchronize the search field with the filter
    useEffect(() => {
        if (externalFilterValue && !valueRef.current) {
            setValue(externalFilterValue)
        }

        if (externalFilterValue && valueRef.current && externalFilterValue !== valueRef.current) {
            setValue(externalFilterValue)
        }

        if (!externalFilterValue && valueRef.current) {
            setValue(undefined)
        }
    }, [externalFilterValue, valueRef])

    const dispatch = useDispatch()

    const changeValue = useCallback((value?: string) => {
        setValue(value || null)
    }, [])

    const changeFilter = useCallback(() => {
        if (valueRef.current === null && externalFilterValueRef.current) {
            dispatch(
                actions.bcRemoveFilter({
                    bcName: bcName,
                    filter: { type: FULL_TEXT_SEARCH, value: '', fieldName: '' }
                })
            )

            dispatch(actions.bcForceUpdate({ bcName: bcName }))
        } else if (valueRef.current !== externalFilterValueRef.current) {
            dispatch(
                actions.bcAddFilter({
                    bcName: bcName,
                    filter: { type: FULL_TEXT_SEARCH, value: valueRef.current as string, fieldName: '' },
                    widgetName: widgetName
                })
            )

            dispatch(actions.bcForceUpdate({ bcName: bcName }))
        }
    }, [valueRef, externalFilterValueRef, dispatch, bcName, widgetName])

    useDebouncedTextSearch(value as string, changeFilter)

    return {
        value,
        changeValue
    }
}
