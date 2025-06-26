import { RefObject, useEffect, useState } from 'react'

const useRefWidth = (ref: RefObject<HTMLDivElement>) => {
    const [width, setWidth] = useState(0)

    useEffect(() => {
        const update = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect()

                setWidth(rect.width)
            }
        }

        update()

        const observer = new ResizeObserver(update)

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [ref])

    return width
}

export default useRefWidth
