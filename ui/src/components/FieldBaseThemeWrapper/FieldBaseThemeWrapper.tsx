import React, { HTMLAttributes } from 'react'
import styles from '@assets/styles/dataEntry.module.less'
import cn from 'classnames'

type FieldBaseThemeWrapperProps = HTMLAttributes<HTMLDivElement>

const FieldBaseThemeWrapper = ({ children, className, ...restProps }: FieldBaseThemeWrapperProps) => {
    return (
        <div {...restProps} className={cn(styles.fieldBaseTheme, className)}>
            {children}
        </div>
    )
}

export default React.memo(FieldBaseThemeWrapper)
