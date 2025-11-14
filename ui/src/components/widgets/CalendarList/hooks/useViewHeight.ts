import { useState, useLayoutEffect } from 'react'
import debounce from 'lodash.debounce'

export const useViewHeight = () => {
    const [height, setHeight] = useState(window.innerHeight)

    useLayoutEffect(() => {
        const debouncedHandleResize = debounce(() => {
            setHeight(window.innerHeight)
        }, 200)

        window.addEventListener('resize', debouncedHandleResize)

        return () => {
            window.removeEventListener('resize', debouncedHandleResize)
            debouncedHandleResize.cancel()
        }
    }, [])

    return height
}
