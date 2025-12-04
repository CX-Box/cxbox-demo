import { RefObject, useCallback, useEffect, useRef } from 'react'

const useFixSelectDropdownForScroll = (selectRef: RefObject<any>) => {
    const tickingRef = useRef(false)

    const alignDropdownFn = useCallback(
        (event: Event) => {
            const target = event.target as HTMLElement | null

            if (!target || target.closest('.ant-select-dropdown')) {
                return
            }

            if (!tickingRef.current) {
                tickingRef.current = true
                requestAnimationFrame(() => {
                    tickingRef.current = false
                    selectRef.current?.rcSelect?.forcePopupAlign?.()
                })
            }
        },
        [selectRef]
    )

    const handleDropdownVisibleChange = useCallback(
        (open: boolean) => {
            if (open) {
                document.addEventListener('scroll', alignDropdownFn, {
                    passive: true,
                    capture: true
                })
            } else {
                document.removeEventListener('scroll', alignDropdownFn, true)
            }
        },
        [alignDropdownFn]
    )

    useEffect(() => {
        return () => {
            document.removeEventListener('scroll', alignDropdownFn, true)
        }
    }, [alignDropdownFn])

    return handleDropdownVisibleChange
}

export default useFixSelectDropdownForScroll
