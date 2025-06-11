import { MutableRefObject, useCallback } from 'react'

export type HorizontalScrollOptions = { type: 'center' } | { type: 'left'; gap: number }

export const useInnerHorizontalScroll = <C extends HTMLElement>(
    containerRef: MutableRefObject<C | null>,
    options: HorizontalScrollOptions = { type: 'center' }
) => {
    const scrollToElement = useCallback(
        (index: number, localOptions: HorizontalScrollOptions = options) => {
            const container = containerRef.current
            const element = container?.querySelector<HTMLElement>(`[data-anchor="true"][data-index="${index}"]`)

            if (container && element) {
                const containerRect = container.getBoundingClientRect()
                const elementRect = element.getBoundingClientRect()

                let scrollLeft: number

                if (localOptions.type === 'left') {
                    scrollLeft = index * (element.offsetWidth + localOptions.gap)
                } else {
                    const elementCenter = elementRect.left - containerRect.left + container.scrollLeft + elementRect.width / 2
                    scrollLeft = elementCenter - containerRect.width / 2
                }

                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                })
            }
        },
        [containerRef, options]
    )

    return { scrollToElement }
}
