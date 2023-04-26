import React from 'react'
import { Avatar, Dropdown } from 'antd'
import UserMenuContent from '../UserMenuContent/UserMenuContent'

export const UserMenu: React.FC = () => {
    return (
        <Dropdown overlay={<UserMenuContent />}>
            <Avatar size="small" alt="avatar" icon="user" />
        </Dropdown>
    )
}

export default React.memo(UserMenu)
