import React from 'react'
import ScreenNavigation from '../ScreenNavigation/ScreenNavigation'
import { Layout } from 'antd'
import logo from '../../assets/icons/logo.svg'
import logoWide from '../../assets/icons/logo-wide.svg'
import styles from './AppSide.less'
import cn from 'classnames'
import { useAppDispatch, useAppSelector } from '@store'
import { changeMenuCollapsed } from '@actions'
import AppInfo from '@components/AppSide/AppInfo/AppInfo'
import { useAppInfo } from '@components/AppSide/hooks'
import { SIDE_BAR_BG_COLOR, SIDE_BAR_COLLAPSED_WIDTH, SIDE_BAR_WIDTH } from '@components/AppSide/constants'

function AppSide() {
    const dispatch = useAppDispatch()
    const menuCollapsed = useAppSelector(state => state.screen.menuCollapsed)
    const handleMenuCollapse = React.useCallback(() => {
        dispatch(changeMenuCollapsed(!menuCollapsed))
    }, [dispatch, menuCollapsed])
    const { data, backgroundColor } = useAppInfo(SIDE_BAR_BG_COLOR)

    return (
        <Layout.Sider
            className={cn(styles.side, menuCollapsed && styles.collapsed)}
            data-test="LEFT_SIDER"
            theme="light"
            collapsed={menuCollapsed}
            collapsedWidth={SIDE_BAR_COLLAPSED_WIDTH}
            width={SIDE_BAR_WIDTH}
        >
            <div className={cn(styles.logoContainer)}>
                <img src={menuCollapsed ? logo : logoWide} onClick={handleMenuCollapse} alt="logo" />
            </div>
            <div className={cn(styles.navigationWrapper)}>
                <ScreenNavigation />
            </div>
            <AppInfo collapsed={menuCollapsed} backgroundColor={backgroundColor} data={data} />
        </Layout.Sider>
    )
}

export default React.memo(AppSide)
