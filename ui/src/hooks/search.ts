import { useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'

export const MIN_SEARCH_LENGTH = 3

export function useDebouncedTextSearch(value: string, doSearch: () => void) {
    const debounced = useDebounce(value, 500)

    useEffect(() => {
        if (debounced !== undefined) {
            const trimmed = debounced?.trim()
            const isReadyForSearch = debounced === null || trimmed?.length >= MIN_SEARCH_LENGTH
            if (isReadyForSearch) {
                doSearch()
            }
        }
    }, [debounced, doSearch])
}

export function useSearchWarning(value: string) {
    const debounced = useDebounce(value, 500)
    const [isWarning, setIsWarning] = useState(false)

    useEffect(() => {
        if (debounced !== undefined) {
            const trimmed = debounced?.trim()

            setIsWarning(trimmed?.length < MIN_SEARCH_LENGTH && debounced !== null)
        }
    }, [debounced, isWarning])

    return isWarning
}
