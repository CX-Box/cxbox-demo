import { RefObject, useLayoutEffect, useState } from 'react'
import { widths } from '../constants'

const usePopupWidth = (ref: RefObject<HTMLDivElement>, width?: string | number, size?: 'medium' | 'large') => {
    const [value, setValue] = useState(0)

    const fixedWidth = width || (size ? widths[size] : widths.medium)

    useLayoutEffect(() => {
        if (width || size || !ref?.current) {
            return
        }

        const setValueOnResize = () => setValue(ref.current?.clientWidth || 0)

        setValueOnResize()

        const observer = new ResizeObserver(setValueOnResize)
        observer.observe(ref.current)

        return () => {
            observer.disconnect()
        }
    }, [ref, size, width])

    return value || fixedWidth
}

export default usePopupWidth
