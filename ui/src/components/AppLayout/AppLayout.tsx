import React from 'react'
import { Layout, Spin } from 'antd'
import AppSide from '../AppSide/AppSide'
import AppBar from '../AppBar/AppBar'
import DevPanel from '../DevPanel/DevPanel'
import styles from './AppLayout.less'
import View from '../View/View'
import SystemNotifications from '../SystemNotifications/SystemNotifications'
import ErrorPopup from '../containers/ErrorPopup/ErrorPopup'
import Notifications from '@components/Notifications/Notifications'
import { Login } from '../Login/Login'
import { useMeta } from '../../queries'

export const AppLayout: React.FC = () => {
    const { isLoading } = useMeta()

    return !isLoading ? (
        <Layout className={styles.root}>
            <Notifications />
            <Spin wrapperClassName={styles.appSpin} spinning={isLoading}>
                <DevPanel />
                <ErrorPopup />
                {/*{modalInvoke?.operation && <ModalInvoke />}*/}
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
        <div className={styles.spinContainer}>{!isLoading ? <Login /> : <Spin size="large" />}</div>
    )
}

export default React.memo(AppLayout)
