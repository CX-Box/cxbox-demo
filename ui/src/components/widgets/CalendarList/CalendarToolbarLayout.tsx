import React from 'react'
import cn from 'classnames'
import styles from './CalendarToolbarLayout.module.less'

export interface CalendarToolbarLayoutProps {
    title: React.ReactNode
    leftControls?: React.ReactNode
    rightControls?: React.ReactNode
    className?: string
}

export const CalendarToolbarLayout: React.FC<CalendarToolbarLayoutProps> = ({ title, leftControls, rightControls, className }) => {
    return (
        <div className={cn(styles.toolbarLayout, className)}>
            <div className={styles.section}>{leftControls}</div>

            <div className={cn(styles.section)}>{title}</div>

            <div className={styles.section}>{rightControls}</div>
        </div>
    )
}
