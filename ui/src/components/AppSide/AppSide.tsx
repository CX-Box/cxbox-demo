import React from 'react'
import ScreenNavigation from '../ScreenNavigation/ScreenNavigation'
import { Layout } from 'antd'
import logo from '../../assets/icons/logo.svg'
import logoWide from '../../assets/icons/logo-wide.svg'
import styles from './AppSide.module.css'
import { useAppDispatch, useAppSelector } from '@store'
import { changeMenuCollapsed } from '@actions'

function AppSide() {
    const dispatch = useAppDispatch()
    const menuCollapsed = useAppSelector(state => state.screen.menuCollapsed)
    const handleMenuCollapse = React.useCallback(() => {
        dispatch(changeMenuCollapsed(!menuCollapsed))
    }, [dispatch, menuCollapsed])

    return (
        <Layout.Sider theme="light" collapsed={menuCollapsed} className={styles.side}>
            <div className={styles.logoContainer}>
                <img src={menuCollapsed ? logo : logoWide} onClick={handleMenuCollapse} alt="logo" />
            </div>
            <ScreenNavigation />
        </Layout.Sider>
    )
}

export default React.memo(AppSide)
