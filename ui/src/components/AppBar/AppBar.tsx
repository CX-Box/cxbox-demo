import React from 'react'
import UserMenu from './components/UserMenu/UserMenu'
import styles from './AppBar.module.css'
import cn from 'classnames'
import { WsNotifications } from '../WsNotifications'

function AppBar() {
    return (
        <div className={cn(styles.container)}>
            <UserMenu />
            <WsNotifications />
        </div>
    )
}

export default React.memo(AppBar)
