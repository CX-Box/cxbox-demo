import React from 'react'
import ScreenNavigation from '../ScreenNavigation/ScreenNavigation'
import { Layout } from 'antd'
import logo from '../../assets/icons/logo.svg'
import logoWide from '../../assets/icons/logo-wide.svg'
import styles from './AppSide.less'
import cn from 'classnames'
import { useAppDispatch, useAppSelector } from '@store'
import { changeMenuCollapsed } from '@actions'

function AppSide() {
    const dispatch = useAppDispatch()
    const menuCollapsed = useAppSelector(state => state.screen.menuCollapsed)
    const handleMenuCollapse = React.useCallback(() => {
        dispatch(changeMenuCollapsed(!menuCollapsed))
    }, [dispatch, menuCollapsed])

    return (
        <Layout.Sider
            className={cn(styles.side, menuCollapsed && styles.collapsed)}
            data-test="LEFT_SIDER"
            theme="light"
            collapsed={menuCollapsed}
            collapsedWidth={48}
            width={256}
        >
            <div className={cn(styles.logoContainer)}>
                <img src={menuCollapsed ? logo : logoWide} onClick={handleMenuCollapse} alt="logo" />
            </div>
            <div className={cn(styles.navigationWrapper)}>
                <ScreenNavigation />
            </div>
        </Layout.Sider>
    )
}

export default React.memo(AppSide)
