import { MutableRefObject, useCallback, useEffect } from 'react'

export const useHorizontalMouseWheelScroll = <C extends HTMLElement>(
    containerRef: MutableRefObject<C | null>,
    { disabled = false }: { disabled?: boolean } = {}
) => {
    const handleMouseWheel = useCallback(
        (e: WheelEvent) => {
            if (containerRef.current) {
                e.preventDefault()
                containerRef.current.scrollLeft += e.deltaY
            }
        },
        [containerRef]
    )

    useEffect(() => {
        const container = containerRef.current

        if (!container || disabled) {
            return
        }

        container.addEventListener('wheel', handleMouseWheel, { passive: false })

        return () => {
            container.removeEventListener('wheel', handleMouseWheel)
        }
    }, [containerRef, disabled, handleMouseWheel])
}
