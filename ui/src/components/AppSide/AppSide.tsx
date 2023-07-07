import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ScreenNavigation from '../ScreenNavigation/ScreenNavigation'
import { AppState } from '../../interfaces/storeSlices'
import { Layout } from 'antd'
import logo from '../../assets/icons/logo.svg'
import logoWide from '../../assets/icons/logo-wide.svg'
import { $do } from '../../actions/types'
import styles from './AppSide.less'
import cn from 'classnames'

function AppSide() {
    const dispatch = useDispatch()
    const menuCollapsed = useSelector((state: AppState) => state.screen.menuCollapsed)
    const handleMenuCollapse = React.useCallback(() => {
        dispatch($do.changeMenuCollapsed(!menuCollapsed))
    }, [dispatch, menuCollapsed])

    return (
        <Layout.Sider
            theme="light"
            collapsed={menuCollapsed}
            className={cn(styles.side, menuCollapsed && styles.collapsed)}
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
