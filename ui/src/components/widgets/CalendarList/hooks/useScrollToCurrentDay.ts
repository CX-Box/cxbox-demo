import React, { useEffect } from 'react'

export type UseScrollToCurrentDayOptions = {
    todaySelector: string
    scrollContainerSelector: string
    delay?: number
}

export const useScrollToCurrentDay = (
    wrapperRef: React.RefObject<HTMLDivElement>,
    { todaySelector, scrollContainerSelector, delay = 100 }: UseScrollToCurrentDayOptions = {} as any
) => {
    const enabled = todaySelector && scrollContainerSelector

    useEffect(() => {
        if (enabled) {
            // A slight delay for FullCalendar to have time to render the DOM
            const timeoutId = setTimeout(() => {
                const wrapper = wrapperRef.current
                const scrollContainer = wrapper?.querySelector(scrollContainerSelector)
                const todayElement = scrollContainer?.querySelector(todaySelector)

                if (scrollContainer && todayElement) {
                    const containerRect = scrollContainer.getBoundingClientRect()
                    const todayRect = todayElement.getBoundingClientRect()

                    const scrollTop =
                        scrollContainer.scrollTop +
                        (todayRect.top - containerRect.top) -
                        scrollContainer.clientHeight / 2 +
                        todayRect.height / 2

                    scrollContainer.scrollTo({
                        top: scrollTop,
                        behavior: 'smooth'
                    })
                }
            }, delay)

            return () => clearTimeout(timeoutId)
        }
    }, [delay, enabled, scrollContainerSelector, todaySelector, wrapperRef])
}
