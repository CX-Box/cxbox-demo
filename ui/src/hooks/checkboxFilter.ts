import React, { RefObject, useCallback, useEffect, useMemo, useState } from 'react'
import { checkboxFilterMaxVisibleItems } from '@constants/filter'

export const useListSearch = (filterValues: Array<{ value: string; icon?: string }>, visible?: boolean) => {
    const [searchText, setSearchText] = useState<string>('')

    const filteredValues = useMemo(() => {
        return searchText.length
            ? filterValues.filter(({ value }) => value?.toLowerCase()?.includes(searchText.toLowerCase()))
            : filterValues
    }, [filterValues, searchText])

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value), [])

    useEffect(() => {
        if (!visible) {
            setSearchText('')
        }
    }, [visible])

    return {
        filteredValues,
        searchText,
        handleSearch
    }
}

export const useListHeight = (listRef: RefObject<HTMLUListElement>, filterValuesLength: number) => {
    const [listHeight, setListHeight] = useState<number | null>()

    useEffect(() => {
        if (listRef.current) {
            if (filterValuesLength > checkboxFilterMaxVisibleItems) {
                const listEl = listRef.current as HTMLUListElement
                const listItems = listEl.querySelectorAll('li')

                let height = 0
                for (let i = 0; i < Math.min(checkboxFilterMaxVisibleItems, listItems.length); i++) {
                    const li = listItems[i] as HTMLElement
                    height += li.offsetHeight
                }

                setListHeight(height)
            } else {
                setListHeight(null)
            }
        }
    }, [filterValuesLength, listRef])

    return listHeight
}
