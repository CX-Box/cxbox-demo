import { MutableRefObject, useCallback, useEffect } from 'react'

export const useHorizontalMouseWheelScroll = <C extends HTMLElement>(containerRef: MutableRefObject<C | null>) => {
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
        if (container) {
            container.addEventListener('wheel', handleMouseWheel)
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleMouseWheel)
            }
        }
    }, [containerRef, handleMouseWheel])
}
