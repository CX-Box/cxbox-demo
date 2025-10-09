import React, { PropsWithChildren } from 'react'
import styles from '@assets/styles/dataEntry.less'
import cn from 'classnames'

type FieldBaseThemeWrapperProps = PropsWithChildren<{
    className?: string
}>

const FieldBaseThemeWrapper = ({ children, className }: FieldBaseThemeWrapperProps) => {
    return <div className={cn(styles.fieldBaseTheme, className)}>{children}</div>
}

export default React.memo(FieldBaseThemeWrapper)
