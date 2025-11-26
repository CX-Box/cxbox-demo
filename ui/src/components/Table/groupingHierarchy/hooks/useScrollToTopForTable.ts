import { useCallback, useEffect, useRef, useState } from 'react'

export const useScrollToTopForTable = (active: boolean, getFirstRowElement: () => Element | null | undefined) => {
    const [showUp, setShowUp] = useState(false)

    const intersectionObserverRef = useRef<IntersectionObserver | undefined>()

    const scrollToTop = useCallback(() => {
        const element = getFirstRowElement()

        setTimeout(() => {
            element?.scrollIntoView({ block: 'center' })
        }, 0)
    }, [getFirstRowElement])

    useEffect(() => {
        intersectionObserverRef.current = active
            ? new IntersectionObserver(entries => {
                  const [entry] = entries

                  setShowUp(!entry.isIntersecting)
              })
            : undefined

        return () => {
            intersectionObserverRef.current?.disconnect()
        }
    }, [active])

    useEffect(() => {
        if (!active) {
            return
        }

        const element = getFirstRowElement()

        if (element) {
            intersectionObserverRef.current?.observe(element)
        }

        return () => {
            if (!active) {
                return
            }

            if (element) {
                intersectionObserverRef.current?.unobserve(element)
            }
        }
    }, [active, getFirstRowElement])

    return {
        scrollToTop,
        showUp
    }
}
