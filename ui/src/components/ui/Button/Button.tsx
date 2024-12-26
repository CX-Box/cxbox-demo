import React from 'react'
import { Button as AntdButton } from 'antd'
import { ButtonProps as AntdButtonProps } from 'antd/lib/button'
import cn from 'classnames'
import styles from './Button.less'

export const customTypes = {
    formOperation: 'formOperation',
    formOperationRed: 'formOperationRed',
    customDefault: 'customDefault',
    bar: 'bar',
    empty: 'empty'
}

type CustomTypes = keyof typeof customTypes
type DefaultTypes = AntdButtonProps['type']
type ButtonsTypes = DefaultTypes | CustomTypes

export interface ButtonProps extends Omit<AntdButtonProps, 'type'> {
    type?: ButtonsTypes | string
    letterCase?: 'upper'
    strong?: boolean
    removeIndentation?: boolean
}

function Button({ type = 'customDefault', className, letterCase, strong, removeIndentation, ...restProps }: ButtonProps) {
    const classNames = cn(
        styles.root,
        className,
        type && styles[type],
        letterCase && styles[letterCase],
        strong && styles.strong,
        removeIndentation && styles.removeIndentation
    )
    const normalizedType = normalizeButtonType(type)

    return <AntdButton className={classNames} type={normalizedType} {...restProps} />
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
