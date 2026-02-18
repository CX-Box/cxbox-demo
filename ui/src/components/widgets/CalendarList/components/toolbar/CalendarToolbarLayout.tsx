import React from 'react'
import cn from 'classnames'
import styles from './CalendarToolbarLayout.module.module.less'

export interface CalendarToolbarLayoutProps {
    title: React.ReactNode
    leftControls?: React.ReactNode
    rightControls?: React.ReactNode
    className?: string
}

export const CalendarToolbarLayout: React.FC<CalendarToolbarLayoutProps> = ({ title, leftControls, rightControls, className }) => {
    return (
        <div className={cn(styles.toolbarLayout, className)}>
            <div className={styles.leftControls}>{leftControls}</div>

            <div className={styles.title}>{title}</div>

            <div className={styles.rightControls}>{rightControls}</div>
        </div>
    )
}
