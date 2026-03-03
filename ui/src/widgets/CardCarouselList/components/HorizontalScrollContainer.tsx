import { forwardRef, useRef, useImperativeHandle } from 'react'
import type { ForwardRefRenderFunction, HTMLAttributes } from 'react'
import { useHorizontalMouseWheelScroll } from '@hooks/useHorizontalMouseWheelScroll'

export interface HorizontalScrollContainerProps extends HTMLAttributes<HTMLDivElement> {
    disabled?: boolean
}

const HorizontalScrollContainer: ForwardRefRenderFunction<HTMLDivElement, HorizontalScrollContainerProps> = (
    { children, disabled, ...restProps },
    externalRef
) => {
    const localRef = useRef<HTMLDivElement | null>(null)

    useImperativeHandle(externalRef, () => localRef.current as HTMLDivElement, [])

    useHorizontalMouseWheelScroll(localRef, { disabled })

    return (
        <div {...restProps} ref={localRef}>
            {children}
        </div>
    )
}

export default forwardRef(HorizontalScrollContainer)
