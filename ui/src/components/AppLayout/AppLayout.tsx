import React from 'react'
import { Layout, Spin } from 'antd'
import AppSide from '../AppSide/AppSide'
import AppBar from '../AppBar/AppBar'
import { useDispatch } from 'react-redux'
import DevPanel from '../DevPanel/DevPanel'
import styles from './AppLayout.module.css'
import View from '../View/View'
import ModalInvoke from '../ModalInvoke/ModalInvoke'
import SystemNotifications from '../SystemNotifications/SystemNotifications'
import Notifications from '@components/Notifications/Notifications'
import { useAppDispatch, useAppSelector } from '../../store'
import { SSO_AUTH } from '../../actions/types'

export const AppLayout: React.FC = () => {
    const sessionActive = useAppSelector(state => state.session.active)
    const logoutRequested = useAppSelector(state => state.session.logout)
    const modalInvoke = useAppSelector(state => state.view.modalInvoke)
    const dispatch = useAppDispatch()

    React.useEffect(() => {
        if (!sessionActive && !logoutRequested) {
            dispatch(SSO_AUTH())
        }
    }, [sessionActive, logoutRequested, dispatch])

    return sessionActive ? (
        <Layout>
            <Notifications />
            <DevPanel />
            {modalInvoke?.operation && <ModalInvoke />}
            <SystemNotifications />
            <Layout className={styles.appLayout}>
                <AppSide />
                <Layout.Content>
                    <AppBar />
                    <View />
                </Layout.Content>
            </Layout>
        </Layout>
    ) : (
        <div className={styles.spinContainer}>
            <Spin size="large" />
        </div>
    )
}

export default React.memo(AppLayout)
