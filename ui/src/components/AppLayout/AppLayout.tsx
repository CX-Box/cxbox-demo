import React from 'react'
import { Layout, Spin } from 'antd'
import AppSide from '../AppSide/AppSide'
import AppBar from '../AppBar/AppBar'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'
import DevPanel from '../DevPanel/DevPanel'
import { SSO_AUTH } from '../../actions/types'
import styles from './AppLayout.less'
import View from '../View/View'
import ModalInvoke from '../ModalInvoke/ModalInvoke'
import SystemNotifications from '../SystemNotifications/SystemNotifications'
import ErrorPopup from '../containers/ErrorPopup/ErrorPopup'

export const AppLayout: React.FC = () => {
    const sessionActive = useSelector((state: AppState) => state.session.active)
    const logoutRequested = useSelector((state: AppState) => state.session.logout)
    const modalInvoke = useSelector((state: AppState) => state.view.modalInvoke)
    const dispatch = useDispatch()

    React.useEffect(() => {
        if (!sessionActive && !logoutRequested) {
            dispatch({ type: SSO_AUTH })
        }
    }, [sessionActive, logoutRequested, dispatch])

    return sessionActive ? (
        <Layout className={styles.root}>
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
        </Layout>
    ) : (
        <div className={styles.spinContainer}>
            <Spin size="large" />
        </div>
    )
}

export default React.memo(AppLayout)
