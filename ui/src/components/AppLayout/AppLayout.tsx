import React, { useCallback } from 'react'
import { Layout, Spin } from 'antd'
import AppSide from '../AppSide/AppSide'
import AppBar from '../AppBar/AppBar'
import DevPanel from '../DevPanel/DevPanel'
import { SSO_AUTH } from '@actions'
import styles from './AppLayout.module.less'
import View from '../View/View'
import ModalInvoke from '../ModalInvoke/ModalInvoke'
import SystemNotifications from '../SystemNotifications/SystemNotifications'
import ErrorPopup from '../containers/ErrorPopup/ErrorPopup'
import { useAppDispatch, useAppSelector } from '@store'
import Notifications from '@components/Notifications/Notifications'
import { Login } from '../Login/Login'
import { useScrollToTopAfterChangeRoute } from '@hooks/useScrollToTopAfterChangeRoute'
import { useSetCssVariable } from '@hooks/useSetCssVariable'
import { addAlphaToHex } from '@utils/color'
import { FIELD_DISABLED_COLOR, WHEN_EDITABLE_FIELD_IS_DISABLED_THEN_FONT_OPACITY } from '@constants'

export const AppLayout: React.FC = () => {
    const dispatch = useAppDispatch()
    const noSSO = Boolean(import.meta.env.VITE_NO_SSO)

    const sessionActive = useAppSelector(state => state.session.active)
    const logoutRequested = useAppSelector(state => state.session.logout)
    const { isMetaRefreshing, loginSpin } = useAppSelector(state => state.session)
    const appSpinning = isMetaRefreshing || loginSpin

    React.useEffect(() => {
        if (!sessionActive && !logoutRequested && !noSSO) {
            dispatch(SSO_AUTH())
        }
    }, [sessionActive, logoutRequested, dispatch, noSSO])

    const getContentElement = useCallback(() => {
        return document.querySelector(`.${CSS.escape(styles.mainContent)}`)
    }, [])

    useSetCssVariable('--field-disabled-color', addAlphaToHex(FIELD_DISABLED_COLOR, WHEN_EDITABLE_FIELD_IS_DISABLED_THEN_FONT_OPACITY))

    useScrollToTopAfterChangeRoute(getContentElement)

    return sessionActive ? (
        <Layout className={styles.root}>
            <Notifications />
            <Spin wrapperClassName={styles.appSpin} spinning={appSpinning}>
                <DevPanel />
                <ErrorPopup />
                <ModalInvoke />
                <SystemNotifications />
                <Layout className={styles.appLayout}>
                    <AppSide />
                    <Layout.Content className={styles.mainContent}>
                        <View />
                        <AppBar />
                    </Layout.Content>
                </Layout>
            </Spin>
        </Layout>
    ) : (
        <div className={styles.spinContainer}>{noSSO ? <Login /> : <Spin size="large" />}</div>
    )
}

export default React.memo(AppLayout)
