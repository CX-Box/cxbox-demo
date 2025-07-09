import { MutableRefObject } from 'react'

export const useInnerHorizontalScroll = <C extends HTMLElement>(
    containerRef: MutableRefObject<C | null>,
    options: { type: 'center' } | { type: 'left'; gap: number } = { type: 'center' }
) => {
    const scrollToElement = (index: number) => {
        const container = containerRef.current
        const element = containerRef.current?.querySelector(`[data-anchor="true"][data-index="${index}"]`) as HTMLElement | undefined

        if (container && element) {
            const containerWidth = container.offsetWidth
            const targetLeft = element.offsetLeft
            const targetWidth = element.offsetWidth
            const scrollLeft =
                options.type === 'left' ? index * (targetWidth + options.gap) : targetLeft - containerWidth / 2 + targetWidth / 2

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            })
        }
    }

    return { scrollToElement }
}
