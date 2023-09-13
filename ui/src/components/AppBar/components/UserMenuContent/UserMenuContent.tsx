import React from 'react'
import { Menu } from 'antd'
import { useAppSelector } from '../../../../store'

export const UserMenuContent: React.FC = () => {
    const { firstName, lastName, login, activeRole, roles } = useAppSelector(state => {
        return {
            firstName: state.session.firstName,
            lastName: state.session.lastName,
            login: state.session.login,
            activeRole: state.session.activeRole,
            roles: state.session.roles
        }
    })
    const dispatch = useDispatch()
    const createSwitchRoleHandler = React.useCallback((roleKey: string) => () => dispatch($do.switchRole({ role: roleKey })), [dispatch])
    const handleLogout = React.useCallback(() => dispatch($do.logout(null)), [dispatch])
    const userName = `${firstName} ${lastName}`
    const activeRoleValue = roles?.find(i => i.key === activeRole)?.value
    return (
        <Menu>
            <Menu.Item key="userName">{userName}</Menu.Item>
            <Menu.Item key="login">{login}</Menu.Item>
            <Menu.Item key="activeRole">{activeRoleValue}</Menu.Item>
            <Menu.Divider key="divider1" />
            <Menu.SubMenu key="roles" title="Roles">
                {roles?.map(i => (
                    <Menu.Item key={i.key} onClick={createSwitchRoleHandler(i.key)}>
                        {i.value}
                    </Menu.Item>
                ))}
            </Menu.SubMenu>
            <Menu.Divider key="divider2" />
            <Menu.Item key="logout" onClick={handleLogout}>
                Log out
            </Menu.Item>
        </Menu>
    )
}

export default React.memo(UserMenuContent)
