import React from 'react'
import { Divider } from 'antd'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../../../interfaces/storeSlices'
import { $do } from '@cxbox-ui/core'
import styles from './UserMenuContent.less'
import cn from 'classnames'
import Button from '../../../ui/Button/Button'
import { UserRole } from '@cxbox-ui/core/interfaces/session'

export const UserMenuContent: React.FC = () => {
    const { firstName, lastName, login, activeRole, roles } = useSelector((state: AppState) => {
        return {
            firstName: state.session.firstName,
            lastName: state.session.lastName,
            login: state.session.login,
            activeRole: state.session.activeRole,
            roles: state.session.roles
        }
    }, shallowEqual)
    const dispatch = useDispatch()
    const createSwitchRoleHandler = React.useCallback((roleKey: string) => () => dispatch($do.switchRole({ role: roleKey })), [dispatch])
    const handleLogout = React.useCallback(() => dispatch($do.logout(null)), [dispatch])
    const fullName = `${lastName} ${firstName}`
    const sortedRoles = React.useMemo(() => roles?.sort(roleComparator), [roles])

    return (
        <div className={styles.root} data-test-menu-user={true}>
            <div className={cn(styles.loginContainer)}>
                <span className={styles.fullName} data-test-menu-user-info-fullName={true}>
                    {fullName}
                </span>
                <span data-test-menu-user-info-login={true}>{login}</span>
            </div>
            <Divider className={styles.divider} />
            <div className={cn(styles.rolesList)}>
                {sortedRoles?.map(i => {
                    return (
                        <div
                            className={cn(styles.roleButtonWrapper, {
                                [styles.checked]: i.key === activeRole
                            })}
                            key={i.key}
                        >
                            <Button
                                className={styles.roleButton}
                                data-test-menu-user-role={true}
                                type="link"
                                onClick={createSwitchRoleHandler(i.key)}
                            >
                                {i.value}
                            </Button>
                        </div>
                    )
                })}
            </div>
            <Divider className={styles.divider} />
            <Button className={cn(styles.signOut)} data-test-menu-user-logout={true} type="default" onClick={handleLogout} icon="logout">
                Log out
            </Button>
        </div>
    )
}

export default React.memo(UserMenuContent)

function roleComparator(a: UserRole, b: UserRole) {
    if (a.value > b.value) {
        return 1
    }

    if (a.value < b.value) {
        return -1
    }

    return 0
}
