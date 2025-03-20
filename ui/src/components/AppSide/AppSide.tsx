import React from 'react'
import ScreenNavigation from '../ScreenNavigation/ScreenNavigation'
import { Layout } from 'antd'
import logo from '../../assets/icons/logo.svg'
import logoWide from '../../assets/icons/logo-wide.svg'
import styles from './AppSide.less'
import cn from 'classnames'
import { useAppDispatch, useAppSelector } from '@store'
import { changeMenuCollapsed } from '@actions'
import InfoSpace from '@components/AppSide/InfoSpace/InfoSpace'
import { useAppInfo } from '@components/AppSide/hooks'

export const SIDE_BAR_BG_COLOR = '#262626'

function AppSide() {
    const dispatch = useAppDispatch()
    const menuCollapsed = useAppSelector(state => state.screen.menuCollapsed)
    const handleMenuCollapse = React.useCallback(() => {
        dispatch(changeMenuCollapsed(!menuCollapsed))
    }, [dispatch, menuCollapsed])
    const { data, backgroundColor, smallContent } = useAppInfo(SIDE_BAR_BG_COLOR)

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
            <InfoSpace collapsed={menuCollapsed} smallContent={smallContent} backgroundColor={backgroundColor} data={data} />
        </Layout.Sider>
    )
}

export default React.memo(AppSide)
