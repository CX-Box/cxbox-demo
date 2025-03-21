import React, { CSSProperties } from 'react'
import styles from './InfoSpace.module.css'
import cn from 'classnames'
import { Icon, Tooltip } from 'antd'
import { getContrastColor } from '@utils/color'
import { useHeightLimiter } from '@components/AppSide/hooks'

interface InfoSpaceProps {
    collapsed: boolean
    backgroundColor: CSSProperties['backgroundColor']
    data?: { key: string; value: string; isPinned?: boolean }[]
}

function InfoSpace({ data, backgroundColor, collapsed }: InfoSpaceProps) {
    const { rootRef, maxHeight } = useHeightLimiter(collapsed)

    if (!data?.length) {
        return null
    }

    const content = data.map((item, i) => (
        <div className={styles.item} key={i}>
            {item.value}
        </div>
    ))

    const smallContent = data
        .filter(item => (collapsed ? item.isPinned : true))
        .map((item, i) => (
            <div className={styles.item} key={i}>
                {item.value}
            </div>
        ))

    return (
        <Tooltip placement="rightTop" title={collapsed ? <div className={styles.tooltip}>{content}</div> : null}>
            <div
                ref={rootRef}
                className={cn(styles.root, { [styles.collapsed]: collapsed })}
                style={{
                    backgroundColor,
                    color: getContrastColor(backgroundColor as string),
                    maxHeight
                }}
            >
                {collapsed ? smallContent.length ? smallContent : <Icon className={styles.icon} type="exclamation-circle" /> : content}
            </div>
        </Tooltip>
    )
}

export default React.memo(InfoSpace)
