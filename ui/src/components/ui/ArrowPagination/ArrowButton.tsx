import React from 'react'
import Button, { ButtonProps } from '@components/ui/Button/Button'
import styles from '@components/ui/ArrowPagination/ArrowPagination.less'
import cn from 'classnames'

interface ArrowButtonProps extends Pick<ButtonProps, 'onClick' | 'disabled' | 'className'> {
    mode?: 'light' | 'dark'
    icon: 'left' | 'right'
}

function ArrowButton({ mode = 'light', className, ...restProps }: ArrowButtonProps) {
    return <Button className={cn(className, styles.button, styles[mode])} type="default" {...restProps} />
}

export default ArrowButton
