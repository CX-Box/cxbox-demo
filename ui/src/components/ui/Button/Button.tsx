import React, { useEffect, useRef } from 'react'
import { Button as AntdButton } from 'antd'
import { ButtonProps as AntdButtonProps } from 'antd/lib/button'
import cn from 'classnames'
import styles from './Button.less'
import ReactDOM from 'react-dom'

export const customTypes = {
    formOperation: 'formOperation',
    formOperationRed: 'formOperationRed',
    customDefault: 'customDefault',
    bar: 'bar',
    empty: 'empty'
}

export type CustomTypes = keyof typeof customTypes
type DefaultTypes = AntdButtonProps['type']
type ButtonsTypes = DefaultTypes | CustomTypes

export interface ButtonProps extends Omit<AntdButtonProps, 'type'> {
    type?: ButtonsTypes | string
    letterCase?: 'upper'
    strong?: boolean
    removeIndentation?: boolean
    bgColor?: string
}

function Button({ type = 'customDefault', className, letterCase, strong, removeIndentation, bgColor, ...restProps }: ButtonProps) {
    const classNames = cn(
        styles.root,
        className,
        type && styles[type],
        letterCase && styles[letterCase],
        strong && styles.strong,
        removeIndentation && styles.removeIndentation
    )
    const normalizedType = normalizeButtonType(type)

    const btnRef = useRef<AntdButton>(null)

    useEffect(() => {
        if (btnRef.current && bgColor) {
            // TODO replace with useRef after upgrading to antd 4 or higher
            const domNode = ReactDOM.findDOMNode(btnRef.current) as HTMLElement

            domNode.style.setProperty('--antd-wave-shadow-color', bgColor)
        }
    }, [bgColor])

    return (
        <AntdButton
            ref={btnRef}
            className={classNames}
            type={normalizedType}
            {...restProps}
            style={{ backgroundColor: bgColor, borderColor: bgColor, ...restProps.style }}
        />
    )
}

export default Button

function isCustomType(type?: string) {
    return !!(type && (customTypes as Record<string, string>)[type])
}

function normalizeButtonType(type?: string): DefaultTypes | undefined {
    if (!isCustomType(type)) {
        return type as DefaultTypes
    }

    if (type === 'empty') {
        return 'link'
    }

    return undefined
}
