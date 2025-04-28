import React, { useCallback } from 'react'
import { Layout, Spin } from 'antd'
import AppSide from '../AppSide/AppSide'
import AppBar from '../AppBar/AppBar'
import DevPanel from '../DevPanel/DevPanel'
import { SSO_AUTH } from '@actions'
import styles from './AppLayout.less'
import View from '../View/View'
import ModalInvoke from '../ModalInvoke/ModalInvoke'
import SystemNotifications from '../SystemNotifications/SystemNotifications'
import ErrorPopup from '../containers/ErrorPopup/ErrorPopup'
import { useAppDispatch, useAppSelector } from '@store'
import Notifications from '@components/Notifications/Notifications'
import { Login } from '../Login/Login'
import { useScrollToTopAfterChangeRoute } from '@hooks/useScrollToTopAfterChangeRoute'

export const AppLayout: React.FC = () => {
    const dispatch = useAppDispatch()
    const noSSO = Boolean(process.env['REACT_APP_NO_SSO'])

    const sessionActive = useAppSelector(state => state.session.active)
    const logoutRequested = useAppSelector(state => state.session.logout)
    const modalInvoke = useAppSelector(state => state.view.modalInvoke)

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

    useScrollToTopAfterChangeRoute(getContentElement)

    return sessionActive ? (
        <Layout className={styles.root}>
            <Notifications />
            <Spin wrapperClassName={styles.appSpin} spinning={appSpinning}>
                <DevPanel />
                <ErrorPopup />
                {modalInvoke?.operation && <ModalInvoke />}
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
