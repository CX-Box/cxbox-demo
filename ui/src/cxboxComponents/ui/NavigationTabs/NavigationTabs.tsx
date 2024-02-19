import React from 'react'
import { Tabs } from 'antd'
import styles from './NavigationTabs.less'
import { useViewTabs } from '@hooks/useViewTabs'
import { useChangeLocation } from '@router'

interface NavigationTabsProps {
    navigationLevel: number
}

function NavigationTabs({ navigationLevel }: NavigationTabsProps) {
    const tabs = useViewTabs(navigationLevel)
    const changeLocation = useChangeLocation()
    const handleChange = (key: string) => {
        changeLocation(key)
    }

    return (
        <nav className={styles.container}>
            <Tabs
                data-test-widget-tabs={true}
                data-test-widget-tabs-depth={navigationLevel}
                activeKey={tabs?.find(item => item.selected)?.url}
                tabBarGutter={24}
                size="large"
                onChange={handleChange}
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

export default React.memo(NavigationTabs)
