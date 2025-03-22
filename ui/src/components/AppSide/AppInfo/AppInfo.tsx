import React, { CSSProperties } from 'react'
import styles from './AppInfo.module.css'
import cn from 'classnames'
import { Icon, Tooltip } from 'antd'
import { getContrastColor } from '@utils/color'
import { useStaticHeightLimiter } from '@components/AppSide/hooks'
import { APP_INFO_COLOR_BOX_WIDTH } from '@components/AppSide/constants'

export type InfoItem = { key: string; value: string; isPinned?: boolean }

interface AppInfoProps {
    collapsed: boolean
    backgroundColor: CSSProperties['backgroundColor']
    data?: InfoItem[]
}

function AppInfo({ data, backgroundColor, collapsed }: AppInfoProps) {
    const { contentRef, contentMaxHeight } = useStaticHeightLimiter(collapsed)

    if (!data?.length) {
        return null
    }

    const createItem = (item: InfoItem, i: number) => (
        <div className={styles.item} key={i}>
            {item.value}
        </div>
    )

    const items = data.map(createItem)

    const smallItems = data.filter(item => (collapsed ? item.isPinned : true)).map(createItem)

    return (
        <Tooltip placement="rightTop" title={collapsed ? <div className={styles.tooltip}>{items}</div> : null}>
            <div className={cn(styles.root, { [styles.collapsed]: collapsed })}>
                <div
                    className={styles.colorBox}
                    style={{ backgroundColor, color: getContrastColor(backgroundColor as string), maxWidth: APP_INFO_COLOR_BOX_WIDTH }}
                >
                    <div ref={contentRef} className={styles.content} style={{ maxHeight: contentMaxHeight }}>
                        {collapsed ? smallItems.length ? smallItems : <Icon className={styles.icon} type="exclamation-circle" /> : items}
                    </div>
                </div>
            </div>
        </Tooltip>
    )
}

export default React.memo(AppInfo)
