import React from 'react'
import { Button } from 'antd'
import cn from 'classnames'
import styles from './OperationButton.module.css'
import { ButtonProps } from 'antd/lib/button/button'

function OperationButton(props: ButtonProps) {
    const { className, ...rest } = props
    return <Button {...rest} className={cn(styles.base, styles.primaryOperation, className)} />
}

export default React.memo(OperationButton)
