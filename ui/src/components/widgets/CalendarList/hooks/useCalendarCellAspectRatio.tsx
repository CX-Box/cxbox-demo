import { RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useSetCssVariable } from '@hooks/useSetCssVariable'

const FRAME_SELECTOR = '.fc-daygrid-day-frame'
const CSS_VARIABLE_NAME = '--fc-frame-min-height'

export const useCalendarCellAspectRatio = (containerRef: RefObject<HTMLElement>, disabled: boolean) => {
    const [cellWidth, setCellWidth] = useState(0)
    const animationFrameId = useRef<number>()

    const handleResize = useCallback<ResizeObserverCallback>(entries => {
        const entry = entries[0]
        if (entry) {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current)
            }
            animationFrameId.current = requestAnimationFrame(() => {
                const newWidth = Math.round(entry.contentRect.width)
                setCellWidth(currentWidth => (currentWidth !== newWidth ? newWidth : currentWidth))
            })
        }
    }, [])

    useLayoutEffect(() => {
        const container = containerRef.current

        if (!container || disabled) {
            return
        }

        const resizeObserver = new ResizeObserver(handleResize)

        let currentObservedElement: HTMLElement | null = null

        const observeNewTarget = () => {
            if (currentObservedElement) {
                resizeObserver.unobserve(currentObservedElement)
            }

            const newTarget = container.querySelector<HTMLElement>(FRAME_SELECTOR)

            if (newTarget) {
                resizeObserver.observe(newTarget)
                currentObservedElement = newTarget
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

        return () => {
            mutationObserver.disconnect()
            resizeObserver.disconnect()

            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current)
            }
        }
    }, [containerRef, disabled, handleResize])

    const minHeightValue = !disabled && cellWidth > 0 ? `${cellWidth}px` : null

    useSetCssVariable(CSS_VARIABLE_NAME, minHeightValue, containerRef)
}
