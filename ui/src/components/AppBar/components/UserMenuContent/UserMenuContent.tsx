import React from 'react'
import { Divider } from 'antd'
import { shallowEqual, useDispatch } from 'react-redux'
import cn from 'classnames'
import { useAppSelector } from '@store'
import Button from '../../../ui/Button/Button'
import { actions, interfaces } from '@cxbox-ui/core'
import { EFeatureSettingKey } from '@interfaces/session'
import styles from './UserMenuContent.less'

export const UserMenuContent: React.FC = () => {
    const { firstName, lastName, login, activeRole, roles, multiroleEnabled } = useAppSelector(state => {
        return {
            firstName: state.session.firstName,
            lastName: state.session.lastName,
            login: state.session.login,
            activeRole: state.session.activeRole,
            roles: state.session.roles,
            multiroleEnabled:
                state.session.featureSettings?.find(feature => feature.key === EFeatureSettingKey.multiroleEnabled)?.value === 'true'
        }
    }, shallowEqual)
    const dispatch = useDispatch()
    const createSwitchRoleHandler = React.useCallback(
        (roleKey: string) => () => dispatch(actions.switchRole({ role: roleKey })),
        [dispatch]
    )
    const handleLogout = React.useCallback(() => dispatch(actions.logout(null)), [dispatch])
    const fullName = `${lastName} ${firstName}`
    const sortedRoles = React.useMemo(() => [...(roles || [])]?.sort(roleComparator), [roles])

    return (
        <div className={cn(styles.root, { [styles.multirole]: multiroleEnabled })} data-test-menu-user={true}>
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
                                [styles.checked]: multiroleEnabled ? true : i.key === activeRole
                            })}
                            key={i.key}
                        >
                            <Button
                                className={styles.roleButton}
                                data-test-menu-user-role={true}
                                type="link"
                                onClick={createSwitchRoleHandler(i.key)}
                                disabled={multiroleEnabled}
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

function roleComparator(a: interfaces.UserRole, b: interfaces.UserRole) {
    if (a.value > b.value) {
        return 1
    }

    if (a.value < b.value) {
        return -1
    }

    return 0
}
