import React from 'react'
import { Icon } from 'antd'
import styles from './ExpandIcon.module.css'
import cn from 'classnames'

interface ExpandIconProps {
    expanded: boolean
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    openIcon?: string
    openRotate?: number
    closeIcon?: string
    className?: string
}

function ExpandIcon({ className, expanded, openIcon, closeIcon, onClick, openRotate }: ExpandIconProps) {
    return (
        <div className={cn(styles.root, className)} onClick={onClick}>
            {expanded
                ? closeIcon && <Icon type={closeIcon} className={styles.icon} />
                : openIcon && <Icon type={openIcon} className={styles.icon} rotate={openRotate} />}
        </div>
    )
}

export default React.memo(ExpandIcon)
