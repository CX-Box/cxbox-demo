import { MutableRefObject } from 'react'

type HorizontalScrollOptions = { type: 'center' } | { type: 'left'; gap: number }

export const useInnerHorizontalScroll = <C extends HTMLElement>(
    containerRef: MutableRefObject<C | null>,
    options: HorizontalScrollOptions = { type: 'center' }
) => {
    const scrollToElement = (index: number, localOptions: HorizontalScrollOptions = options) => {
        const container = containerRef.current
        const element = containerRef.current?.querySelector(`[data-anchor="true"][data-index="${index}"]`) as HTMLElement | undefined

        if (container && element) {
            const containerWidth = container.offsetWidth
            const targetLeft = element.offsetLeft
            const targetWidth = element.offsetWidth
            const scrollLeft =
                localOptions.type === 'left' ? index * (targetWidth + localOptions.gap) : targetLeft - containerWidth / 2 + targetWidth / 2

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            })
        }
    }

    return { scrollToElement }
}
