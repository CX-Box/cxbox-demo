import { useCallback, useEffect } from 'react'
import { useAppSelector } from '@store'
import { usePrevious } from '@hooks/usePrevious'

export const useScrollToTopAfterChangeRoute = (getElement: () => HTMLElement | null | undefined) => {
    const scrollToTop = useCallback(() => {
        const element = getElement()

        if (element) {
            setTimeout(() => {
                element.scrollTo(0, 0)
            }, 0)
        }
    }, [getElement])

    const currentPath = useAppSelector(state => state.router.path)
    const currentInitiator = useAppSelector(state => state.router.initiator)
    const previousPath = usePrevious(currentPath)

    useEffect(() => {
        if (currentPath?.length && previousPath?.length && currentPath !== previousPath && currentInitiator !== 'tab') {
            scrollToTop()
        }
    }, [currentInitiator, currentPath, previousPath, scrollToTop])
}
