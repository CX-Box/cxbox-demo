import { RefObject, useCallback, useRef, useEffect } from 'react'
import { useResizeObserver } from '@hooks/useResizeObserver'

export const useDebouncedWidthResize = (
    ref: RefObject<HTMLElement>,
    onResize: (width: number, entry: ResizeObserverEntry) => void,
    delay: number = 100
) => {
    const prevWidth = useRef<number>(0)
    const resizeTimer = useRef<ReturnType<typeof setTimeout>>()
    const onResizeRef = useRef(onResize)

    useEffect(() => {
        onResizeRef.current = onResize
    }, [onResize])

    const handleResize = useCallback<ResizeObserverCallback>(
        entries => {
            const entry = entries?.[0]

            if (!entry) {
                return
            }

            const width = entry.contentRect.width

            // Ignore changes if the width has not changed.
            if (Math.abs(prevWidth.current - width) < 1) {
                return
            }

            prevWidth.current = width

            if (resizeTimer.current) {
                clearTimeout(resizeTimer.current)
            }

            resizeTimer.current = setTimeout(() => {
                window.requestAnimationFrame(() => {
                    onResizeRef.current(width, entry)
                })
            }, delay)
        },
        [delay]
    )

    useResizeObserver(ref, handleResize)

    useEffect(() => {
        return () => {
            if (resizeTimer.current) {
                clearTimeout(resizeTimer.current)
            }
        }
    }, [])
}
