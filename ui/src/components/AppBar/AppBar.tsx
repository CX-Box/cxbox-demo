import React from 'react'
import UserMenu from './components/UserMenu/UserMenu'
import styles from './AppBar.module.css'
import cn from 'classnames'

function AppBar() {
    return (
        <div className={cn(styles.container)}>
            <UserMenu />
        </div>
    )
}

export default React.memo(AppBar)
