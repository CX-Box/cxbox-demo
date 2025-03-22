import React, { CSSProperties } from 'react'
import styles from './InfoSpace.module.css'
import cn from 'classnames'
import { Icon, Tooltip } from 'antd'
import { getContrastColor } from '@utils/color'
import { useHeightLimiter } from '@components/AppSide/hooks'

interface AppInfoProps {
    collapsed: boolean
    backgroundColor: CSSProperties['backgroundColor']
    data?: { key: string; value: string; isPinned?: boolean }[]
}

function AppInfo({ data, backgroundColor, collapsed }: AppInfoProps) {
    const { contentRef, contentMaxHeight } = useHeightLimiter(collapsed)

    if (!data?.length) {
        return null
    }

    const items = data.map((item, i) => (
        <div className={styles.item} key={i}>
            {item.value}
        </div>
    ))

    const smallItems = data
        .filter(item => (collapsed ? item.isPinned : true))
        .map((item, i) => (
            <div className={styles.item} key={i}>
                {item.value}
            </div>
        ))

    let contrastColor = getContrastColor(backgroundColor as string)
    return (
        <Tooltip placement="rightTop" title={collapsed ? <div className={styles.tooltip}>{items}</div> : null}>
            <div className={cn(styles.root, { [styles.collapsed]: collapsed })}>
                <div className={styles.colorBox} style={{ backgroundColor, color: contrastColor }}>
                    <div ref={contentRef} className={styles.content} style={{ maxHeight: contentMaxHeight }}>
                        {collapsed ? smallItems.length ? smallItems : <Icon className={styles.icon} type="exclamation-circle" /> : items}
                    </div>
                </div>
            </div>
        </Tooltip>
    )
}

export default React.memo(AppInfo)
