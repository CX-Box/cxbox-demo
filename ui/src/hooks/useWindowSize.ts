import { useState, useLayoutEffect, useCallback } from 'react'
import debounce from 'lodash.debounce'

const getWindowSize = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    }
}

interface UseWindowSizeOptions {
    wait?: number
    track?: {
        width?: boolean
        height?: boolean
    }
}

export const useWindowSize = ({ wait = 100, track }: UseWindowSizeOptions = {}) => {
    const trackWidth = track ? !!track.width : true
    const trackHeight = track ? !!track.height : true

    const getTrackableSize = useCallback(() => {
        const size = getWindowSize()
        return {
            width: trackWidth ? size.width : undefined,
            height: trackHeight ? size.height : undefined
        }
    }, [trackHeight, trackWidth])

    const updateSize = useCallback(
        (currentSize: { width: number | undefined; height: number | undefined }) => {
            const newSize = getTrackableSize()

            const areSizesEqual = currentSize.width === newSize.width && currentSize.height === newSize.height

            if (areSizesEqual) {
                return currentSize
            }

            return newSize
        },
        [getTrackableSize]
    )

    const [windowSize, setWindowSize] = useState(getTrackableSize)

    useLayoutEffect(() => {
        setWindowSize(updateSize)

        if (!trackWidth && !trackHeight) {
            return
        }

        const handleResize = debounce(() => {
            setWindowSize(updateSize)
        }, wait)

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            handleResize.cancel()
        }
    }, [wait, trackWidth, trackHeight, updateSize])

    return windowSize
}
