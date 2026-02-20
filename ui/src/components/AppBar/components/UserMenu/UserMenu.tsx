import React from 'react'
import { Avatar, Popover } from 'antd'
import UserMenuContent from '../UserMenuContent/UserMenuContent'
import styles from './UserMenu.module.less'
import Button from '../../../ui/Button/Button'

export const UserMenu: React.FC = () => {
    return (
        <Popover overlayClassName={styles.popover} content={<UserMenuContent />} trigger="click" placement="bottomRight">
            <Button type="bar">
                <Avatar className={styles.avatar} size="default" alt="avatar" icon="user" />
            </Button>
        </Popover>
    )
}

export default React.memo(UserMenu)
