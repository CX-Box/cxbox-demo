import { RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react'

const MULTIMONTH_YEAR_SELECTOR = '.fc-multiMonthYear-view .fc-multimonth-month'

export const useCalendarMultimonthYearHeight = (containerRef: RefObject<HTMLElement>, disabled: boolean) => {
    const [multimonthHeight, setMultimonthHeight] = useState(0)
    const animationFrameId = useRef<number>()

    const calculate = useCallback(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current)
        }

        animationFrameId.current = requestAnimationFrame(() => {
            const container = containerRef.current
            if (!container) {
                return
            }

            const multimonthYear = container.querySelector(MULTIMONTH_YEAR_SELECTOR)
            if (!multimonthYear) {
                return
            }
            // Get height for the square
            let newSize = Math.round(multimonthYear.getBoundingClientRect().height)

            setMultimonthHeight(currentHeight => (currentHeight !== newSize ? newSize : currentHeight))
        })
    }, [containerRef])

    useLayoutEffect(() => {
        const container = containerRef.current

        if (!container || disabled) {
            return
        }

        // Watch for container size changes
        const resizeObserver = new ResizeObserver(calculate)
        resizeObserver.observe(container)

        // Initial
        calculate()

        return () => {
            resizeObserver.disconnect()

            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current)
            }
        }
    }, [containerRef, disabled, calculate])

    return !disabled && multimonthHeight > 0 ? `${multimonthHeight}px` : undefined
}
