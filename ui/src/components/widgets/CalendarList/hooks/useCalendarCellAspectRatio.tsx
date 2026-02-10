import { RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useSetCssVariable } from '@hooks/useSetCssVariable'

const DAY_FRAME_SELECTOR = '.fc-daygrid-day-frame'
const DAY_GRID_ROW_SELECTOR = '.fc-daygrid-body tr'
const CSS_VARIABLE_NAME = '--fc-frame-min-height'
const MAX_VIEWPORT_HEIGHT_RATIO = 0.8

export const useCalendarCellAspectRatio = (containerRef: RefObject<HTMLElement>, disabled: boolean) => {
    const [cellWidth, setCellWidth] = useState(0)
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

            const cell = container.querySelector(DAY_FRAME_SELECTOR)
            if (!cell) {
                return
            }
            // Get height for the square
            let newSize = Math.round(cell.getBoundingClientRect().width)

            const containerRect = container.getBoundingClientRect()
            const viewportHeight = window.innerHeight

            const distanceToBottom = viewportHeight - containerRect.top
            const minHeight = viewportHeight * MAX_VIEWPORT_HEIGHT_RATIO
            const availableHeight = distanceToBottom < minHeight ? minHeight : distanceToBottom

            const rows = container.querySelectorAll(DAY_GRID_ROW_SELECTOR)
            const rowCount = rows.length

            // If the total height of the squares exceeds the available height, reduce the cell height
            if (rowCount > 0 && availableHeight && rowCount * newSize > availableHeight) {
                newSize = Math.floor(availableHeight / rowCount)
            }

            setCellWidth(currentWidth => (currentWidth !== newSize ? newSize : currentWidth))
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

        // Watch for window size changes (height may change without changing container width)
        window.addEventListener('resize', calculate)

        let currentObservedElement: HTMLElement | null = null

        // Watch for calendar cells appearance (rendered asynchronously)
        const observeNewTarget = () => {
            const newTarget = container.querySelector<HTMLElement>(DAY_FRAME_SELECTOR)

            if (newTarget && newTarget !== currentObservedElement) {
                if (currentObservedElement) {
                    resizeObserver.unobserve(currentObservedElement)
                }
                resizeObserver.observe(newTarget)
                currentObservedElement = newTarget

                calculate()
            }
        }

        const mutationObserver = new MutationObserver(() => {
            observeNewTarget()
        })

        observeNewTarget()

        mutationObserver.observe(container, {
            childList: true,
            subtree: true
        })

        // Initial
        calculate()

        return () => {
            mutationObserver.disconnect()
            resizeObserver.disconnect()
            window.removeEventListener('resize', calculate)

            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current)
            }
        }
    }, [containerRef, disabled, calculate])

    const minHeightValue = !disabled && cellWidth > 0 ? `${cellWidth}px` : null

    useSetCssVariable(CSS_VARIABLE_NAME, minHeightValue, containerRef)
}
