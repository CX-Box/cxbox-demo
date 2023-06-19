import React from 'react'
import { Tabs } from 'antd'
import styles from './ViewNavigation.module.css'
import { useViewTabs } from './ViewNavigation.hook'

interface ViewNavigationProps {
    depth?: number
}

function ViewNavigation({ depth = 1 }: ViewNavigationProps) {
    const { tabs, handleChange, activeKey } = useViewTabs(depth)

    return (
        <nav className={styles.container}>
            <Tabs activeKey={activeKey} tabBarGutter={24} size="default" onChange={handleChange}>
                {tabs.map(tab => (
                    <Tabs.TabPane key={tab.url} tab={<span className={styles.item}>{tab.title}</span>} />
                ))}
            </Tabs>
        </nav>
    )
}

export default React.memo(ViewNavigation)
