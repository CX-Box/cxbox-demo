import { useCallback, useRef, useState } from 'react'

export const useHover = <Element extends HTMLElement>(): [(node: Element) => void, boolean] => {
    const [isHovering, setIsHovering] = useState(false)

    const handleMouseOver = useCallback(() => setIsHovering(true), [])
    const handleMouseOut = useCallback(() => setIsHovering(false), [])

    const nodeRef = useRef<Element>()

    const callbackRef = useCallback(
        node => {
            if (nodeRef.current) {
                nodeRef.current.removeEventListener('mouseover', handleMouseOver)
                nodeRef.current.removeEventListener('mouseout', handleMouseOut)
            }

            nodeRef.current = node

            if (nodeRef.current) {
                nodeRef.current.addEventListener('mouseover', handleMouseOver)
                nodeRef.current.addEventListener('mouseout', handleMouseOut)
            }
        },
        [handleMouseOver, handleMouseOut]
    )

    return [callbackRef, isHovering]
}
