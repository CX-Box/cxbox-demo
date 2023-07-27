import React from 'react'
import { Icon } from 'antd'
import styles from './ExpandIcon.module.css'

interface ExpandIconProps {
    expanded: boolean
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    openIcon?: string
    closeIcon?: string
}

function ExpandIcon({ expanded, openIcon, closeIcon, onClick }: ExpandIconProps) {
    return (
        <div className={styles.root} onClick={onClick}>
            {expanded
                ? closeIcon && <Icon type={closeIcon} className={styles.icon} />
                : openIcon && <Icon type={openIcon} className={styles.icon} />}
        </div>
    )
}

export default React.memo(ExpandIcon)
