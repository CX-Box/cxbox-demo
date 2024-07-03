import React from 'react'
import { Tabs } from 'antd'
import styles from './ViewNavigation.less'
import { useViewTabs } from './ViewNavigation.hooks'
import { TabsProps } from 'antd/es/tabs'
import cn from 'classnames'

interface ViewNavigationProps extends Pick<TabsProps, 'type'> {
    depth?: number
}

export function ViewNavigation({ depth = 1, type = 'card' }: ViewNavigationProps) {
    const { tabs, handleChange, activeKey } = useViewTabs(depth)

    return (
        <nav className={cn(styles.container, styles[type])}>
            <Tabs
                data-test-widget-tabs={true}
                data-test-widget-tabs-depth={depth}
                activeKey={activeKey}
                tabBarGutter={24}
                onChange={handleChange}
                type={type}
            >
                {tabs
                    .filter(item => item.title !== undefined)
                    .map(tab => (
                        <Tabs.TabPane
                            key={tab.url}
                            tab={
                                <span className={styles.item} data-test-navigation-tabs-item={true}>
                                    {tab.title}
                                </span>
                            }
                        />
                    ))}
            </Tabs>
        </nav>
    )
}

export default React.memo(ViewNavigation)
