import React, { CSSProperties } from 'react'
import styles from './InfoSpace.module.css'
import cn from 'classnames'
import { Icon, Tooltip } from 'antd'
import { getContrastColor } from '@utils/color'

interface InfoSpaceProps {
    collapsed: boolean
    backgroundColor: CSSProperties['backgroundColor']
    data?: { title?: string; value: string }[]
    smallContent?: string | null
}

function InfoSpace({ data, backgroundColor, collapsed, smallContent }: InfoSpaceProps) {
    if (!data?.length) {
        return null
    }

    const content = data.map((item, i) => (
        <div className={styles.item} key={i}>
            {item.title && <span className={styles.label}>{item.title}</span>}
            <span className={styles.value}>{item.value}</span>
        </div>
    ))

    return (
        <Tooltip placement="rightTop" title={<div className={styles.tooltipContent}>{content}</div>}>
            <div
                className={cn(styles.root, { [styles.collapsed]: collapsed })}
                style={{ backgroundColor, color: backgroundColor ? getContrastColor(backgroundColor as string) : undefined }}
            >
                {collapsed ? (
                    <span className={styles.smallContent}>
                        {smallContent ?? <Icon className={styles.icon} type="exclamation-circle" />}
                    </span>
                ) : (
                    <div className={styles.mainContent}>{content}</div>
                )}
            </div>
        </Tooltip>
    )
}

export default React.memo(InfoSpace)
