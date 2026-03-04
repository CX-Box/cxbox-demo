import React from 'react'
import { Input } from 'antd'
import { InputProps } from 'antd/es/input'
import cn from 'classnames'
import styles from './Input.less'

interface CustomInputProps extends InputProps {}

function CustomInput({ className, ...restProps }: CustomInputProps) {
    return <Input className={cn(styles.root, className)} {...restProps} />
}

export default React.memo(CustomInput)
