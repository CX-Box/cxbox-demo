import { useState, useLayoutEffect } from 'react'
import debounce from 'lodash.debounce'

export const useViewHeight = (disabled: boolean = false) => {
    const [height, setHeight] = useState(window.innerHeight)

    useLayoutEffect(() => {
        if (disabled) {
            return
        }

        const debouncedHandleResize = debounce(() => {
            setHeight(window.innerHeight)
        }, 200)

        window.addEventListener('resize', debouncedHandleResize)

        return () => {
            window.removeEventListener('resize', debouncedHandleResize)
            debouncedHandleResize.cancel()
        }
    }, [disabled])

    return disabled ? undefined : height
}
