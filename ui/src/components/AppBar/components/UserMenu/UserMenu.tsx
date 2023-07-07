import React from 'react'
import { Avatar, Popover } from 'antd'
import UserMenuContent from '../UserMenuContent/UserMenuContent'
import styles from './UserMenu.less'

export const UserMenu: React.FC = () => {
    return (
        <Popover overlayClassName={styles.popover} content={<UserMenuContent />} trigger="click" placement="bottomRight">
            <span className={styles.infoButton}>
                <Avatar className={styles.avatar} size="default" alt="avatar" icon="user" />
            </span>
        </Popover>
    )
}

export default React.memo(UserMenu)
