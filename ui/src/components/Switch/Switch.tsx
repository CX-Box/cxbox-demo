import React, { Children, isValidElement, ReactNode } from 'react'
import Default from '@components/Switch/Default'
import Case from '@components/Switch/Case'

interface SwitchProps {
    test: string | number | boolean | undefined | null
    children?: ReactNode
}

const Switch: React.FC<SwitchProps> = ({ test, children }) => {
    let currentCase: ReactNode = null
    let defaultCase: ReactNode = null

    Children.forEach(children, child => {
        if (isValidElement(child)) {
            if (!currentCase && child.type === Case && child.props.value === test) {
                currentCase = child
            } else if (child.type === Default) {
                defaultCase = child
            }
        }
    })

    return <>{currentCase ?? defaultCase}</>
}

export default Switch
