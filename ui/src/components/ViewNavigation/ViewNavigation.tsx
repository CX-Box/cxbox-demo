import React from 'react'
import { Tabs } from 'antd'
import styles from './ViewNavigation.less'
import { TabsProps } from 'antd/lib/tabs'
import cn from 'classnames'
import { useViewTabs } from '@hooks/useViewTabs'
import { useChangeLocation } from '@router'

interface ViewNavigationProps extends Pick<TabsProps, 'type'> {
    depth?: number
}

export function ViewNavigation({ depth = 1, type = 'card' }: ViewNavigationProps) {
    const tabs = useViewTabs(depth)

    const changeLocation = useChangeLocation()

    const handleChange = (key: string) => {
        changeLocation(key)
    }

    return (
        <nav className={cn(styles.container, styles[type])}>
            <Tabs
                data-test-widget-tabs={true}
                data-test-widget-tabs-depth={depth}
                activeKey={tabs?.find(item => item.selected)?.url}
                tabBarGutter={24}
                onChange={handleChange}
                type={type}
            >
                {tabs?.map(item => (
                    <Tabs.TabPane
                        key={item.url}
                        tab={
                            <span className={styles.item} data-test-navigation-tabs-item={true}>
                                {item.title}
                            </span>
                        }
                    />
                ))}
            </Tabs>
        </nav>
    )
}

export default React.memo(ViewNavigation)
