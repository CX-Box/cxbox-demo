import React from 'react'
import { Divider } from 'antd'
import { shallowEqual, useDispatch } from 'react-redux'
import { useAppSelector } from '@store'
import { actions, interfaces } from '@cxbox-ui/core'
import styles from './UserMenuContent.less'
import cn from 'classnames'
import Button from '../../../ui/Button/Button'
import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../../../../api'
import { useMeta } from '../../../../queries'

export const UserMenuContent: React.FC = () => {
    const { data } = useMeta()

    // const createSwitchRoleHandler = React.useCallback(
    //     (roleKey: string) => () => dispatch(actions.switchRole({ role: roleKey })),
    //     [dispatch]
    // )
    // const handleLogout = React.useCallback(() => dispatch(actions.logout(null)), [dispatch])
    const sortedRoles = React.useMemo(() => data?.roles?.sort(roleComparator), [data?.roles])

    const fullName = `${data?.firstName} ${data?.lastName}`

    return (
        <div className={styles.root} data-test-menu-user={true}>
            <div className={cn(styles.loginContainer)}>
                <span className={styles.fullName} data-test-menu-user-info-fullName={true}>
                    {fullName}
                </span>
                <span data-test-menu-user-info-login={true}>{data?.login}</span>
            </div>
            <Divider className={styles.divider} />
            <div className={cn(styles.rolesList)}>
                {sortedRoles?.map(i => {
                    return (
                        <div
                            className={cn(styles.roleButtonWrapper, {
                                [styles.checked]: i.key === data?.activeRole
                            })}
                            key={i.key}
                        >
                            <Button
                                className={styles.roleButton}
                                data-test-menu-user-role={true}
                                type="link"
                                // onClick={createSwitchRoleHandler(i.key)}
                            >
                                {i.value}
                            </Button>
                        </div>
                    )
                })}
            </div>
            <Divider className={styles.divider} />
            <Button className={cn(styles.signOut)} data-test-menu-user-logout={true} type="default" icon="logout">
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
