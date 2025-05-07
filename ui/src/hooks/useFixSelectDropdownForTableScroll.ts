import { RefObject, useCallback, useEffect, useRef } from 'react'

const useFixSelectDropdownForTableScroll = (selectRef: RefObject<any>) => {
    const scrollContainerRef = useRef<HTMLElement | null>(null)

    const alignDropdownFn = useCallback(() => {
        selectRef.current?.rcSelect?.forcePopupAlign?.()
    }, [selectRef])

    const handleDropdownVisibleChange = useCallback(
        (open: boolean) => {
            const tableScrollContainer = selectRef.current?.rcSelect?.rootRef?.closest('.ant-table-body')
            scrollContainerRef.current = tableScrollContainer

            if (!tableScrollContainer) {
                return
            }

            if (open) {
                tableScrollContainer.addEventListener('scroll', alignDropdownFn)
            } else {
                tableScrollContainer.removeEventListener('scroll', alignDropdownFn)
            }
        },
        [alignDropdownFn, selectRef]
    )

    useEffect(() => {
        return () => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.removeEventListener('scroll', alignDropdownFn)
            }
        }
    }, [alignDropdownFn])

    return handleDropdownVisibleChange
}

export default useFixSelectDropdownForTableScroll
