import React from 'react'
import { Button as AntdButton } from 'antd'
import { ButtonProps as AntdButtonProps } from 'antd/lib/button'
import cn from 'classnames'
import styles from './Button.less'

export const customTypes = {
    formOperation: 'formOperation',
    formOperationYellow: 'formOperationYellow',
    customDefault: 'customDefault',
    bar: 'bar'
}

type CustomTypes = keyof typeof customTypes
type DefaultTypes = AntdButtonProps['type']
type ButtonsTypes = DefaultTypes | CustomTypes

export interface ButtonProps extends Omit<AntdButtonProps, 'type'> {
    type?: ButtonsTypes | string
    letterCase?: 'upper'
    strong?: boolean
}

function Button({ type = 'customDefault', className, letterCase, strong, ...restProps }: ButtonProps) {
    const classNames = cn(styles.root, className, type && styles[type], letterCase && styles[letterCase], strong && styles.strong)
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

    return undefined
}
