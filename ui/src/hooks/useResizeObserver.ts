import { RefObject, useLayoutEffect, useRef } from 'react'

/**
 * @warning The logic inside the callback can trigger a 'ResizeObserver loop' error.
 * This happens if the callback causes the observed element to resize.
 */
export const useResizeObserver = <T extends HTMLElement>(elementRef: RefObject<T>, callback: ResizeObserverCallback) => {
    const callbackRef = useRef(callback)

    useLayoutEffect(() => {
        callbackRef.current = callback
    })

    useLayoutEffect(() => {
        const element = elementRef.current

        if (!element) {
            return
        }

        const resizeObserver = new ResizeObserver((entries, obs) => {
            callbackRef.current(entries, obs)
        })

        resizeObserver.observe(element)

        return () => {
            resizeObserver.disconnect()
        }
    }, [elementRef])
}
