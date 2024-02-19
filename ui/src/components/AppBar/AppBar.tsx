import React from 'react'
import UserMenu from './components/UserMenu/UserMenu'
import styles from './AppBar.module.css'
import cn from 'classnames'
import { Notification } from '../Notification/Notification'

function AppBar() {
    return (
        <div className={cn(styles.container)}>
            <UserMenu />
            <Notification />
        </div>
    )
}

export default React.memo(AppBar)
