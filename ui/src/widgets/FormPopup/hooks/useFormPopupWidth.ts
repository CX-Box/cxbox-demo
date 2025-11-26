import { RefObject, useEffect, useLayoutEffect, useState } from 'react'
import debounce from 'lodash.debounce'

const useFormPopupWidth = (ref: RefObject<HTMLDivElement>) => {
    const [value, setValue] = useState(0)

    const currentWidth = ref?.current?.clientWidth || 0

    useEffect(() => {
        setValue(currentWidth)
    }, [currentWidth])

    useLayoutEffect(() => {
        const setValueOnResize = () => setValue(ref?.current?.clientWidth || 0)

        const debouncedSetValueOnResize = debounce(setValueOnResize, 100)

        window.addEventListener('resize', debouncedSetValueOnResize)

        return () => window.removeEventListener('resize', debouncedSetValueOnResize)
    }, [ref])

    return value
}

export default useFormPopupWidth
