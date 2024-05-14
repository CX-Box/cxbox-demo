import React, { useEffect } from 'react'
import { Button, Layout, Popover, Spin } from 'antd'
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
import { keycloak, keycloakOptions } from '../../keycloak'
import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../../api'
import { useMeta } from '../../queries'
import { useBrowserLocation } from 'wouter/use-browser-location'
import { useRoute, useRouter } from 'wouter'

export const AppLayout: React.FC = () => {
    const { isFetching } = useMeta()

    return !isFetching ? (
        <Layout className={styles.root}>
            <Notifications />
            <Spin wrapperClassName={styles.appSpin} spinning={isFetching}>
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
        <div className={styles.spinContainer}>{!isFetching ? <Login /> : <Spin size="large" />}</div>
    )
}

export default React.memo(AppLayout)
