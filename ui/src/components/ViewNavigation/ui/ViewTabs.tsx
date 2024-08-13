import React from 'react'
import { Tabs } from 'antd'
import styles from './ViewTabs.less'
import { TabsProps } from 'antd/es/tabs'
import cn from 'classnames'

interface ViewTabsProps extends Pick<TabsProps, 'type' | 'activeKey' | 'onChange'> {
    tabs?: Pick<{ title?: string; url: string }, any>[]
    onChange?: (activeKey: string) => void
    depth: number
}

export function ViewTabs({ activeKey, onChange, type = 'card', depth, tabs }: ViewTabsProps) {
    return (
        <nav className={cn(styles.container, styles[type])}>
            <Tabs
                data-test-widget-tabs={true}
                data-test-widget-tabs-depth={depth}
                activeKey={activeKey}
                tabBarGutter={24}
                onChange={onChange}
                type={type}
            >
                {tabs
                    ?.filter(item => item.title !== undefined)
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
