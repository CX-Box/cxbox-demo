import React from 'react'
import { Menu, Icon } from 'antd'
import { changeLocation } from '@cxbox-ui/core'
import styles from './ScreenNavigation.module.css'
import { ClickParam } from 'antd/lib/menu'
import { useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'

function ScreenNavigation() {
    const screens = useSelector((state: AppState) => state.session.screens)
    const screenName = useSelector((state: AppState) => state.router.screenName)
    const selectedScreen = screens.find(item => item.name === screenName) || screens.find(screen => screen.defaultScreen) || screens[0]
    const screenUrl = selectedScreen?.url ?? `/screen/${screenName}`
    const handleScreen = (e: ClickParam) => {
        changeLocation(e.key)
    }

    return (
        <div className={styles.menuContainer}>
            <Menu className={styles.Container} selectedKeys={[screenUrl]} onClick={handleScreen} theme="light">
                {screens.map(item => {
                    return (
                        <Menu.Item key={item.url} className={styles.Item}>
                            <span className={styles.MenuItemLink}>
                                <Icon type={item.icon ? item.icon : 'coffee'} />
                                <span>{item.text}</span>
                            </span>
                        </Menu.Item>
                    )
                })}
            </Menu>
        </div>
    )
}

export default React.memo(ScreenNavigation)
