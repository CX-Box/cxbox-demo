import React from 'react'
import { Avatar, Popover } from 'antd'
import UserMenuContent from '../UserMenuContent/UserMenuContent'
import styles from './UserMenu.less'
import { useSelector } from 'react-redux'
import { AppState } from '../../../../interfaces/storeSlices'

export const UserMenu: React.FC = () => {
    const fullName = useSelector((state: AppState) => `${state.session.lastName} ${state.session.firstName}`)

    return (
        <Popover overlayClassName={styles.popover} content={<UserMenuContent />} trigger="click" placement="bottomRight">
            <span className={styles.infoButton}>
                <span>{fullName}</span>
                <Avatar className={styles.avatar} size="default" alt="avatar" icon="user" />
            </span>
        </Popover>
    )
}

export default React.memo(UserMenu)
