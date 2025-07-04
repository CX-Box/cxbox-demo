import { RefObject, useEffect, useState } from 'react'

const useFilePreviewRect = (ref: RefObject<HTMLDivElement>) => {
    const [rect, setRect] = useState<{ width: number; top: number }>({ width: 0, top: 0 })

    useEffect(() => {
        const update = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect()

                setRect({ width: rect.width, top: rect.top })
            }
        }

        update()

        const observer = new ResizeObserver(update)

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [ref])

    return rect
}

export default useFilePreviewRect
