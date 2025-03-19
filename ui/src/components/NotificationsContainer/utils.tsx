import { notification } from 'antd'
import cn from 'classnames'
import { ArgsProps } from 'antd/lib/notification'
import {
    notifications,
    maxItems,
    directionItems,
    timeout,
    ENotificationMode,
    EDirection,
    notificationsContainerId
} from '@components/NotificationsContainer/constants'
import { store } from '@store'
import { EFeatureSettingKey } from '@interfaces/session'
import styles from './NotificationsContainer.module.css'

const isDirectionDownward = directionItems === EDirection.downward

interface ICustomNotification extends Omit<ArgsProps, 'getContainer'> {}

export const openNotification = (props: ICustomNotification) => {
    notification.open({
        ...props,
        top: 64,
        className: cn(props.className, {
            [styles.downward]: isDirectionDownward
        }),
        getContainer: () => document.getElementById(notificationsContainerId) || document.body
    })
}

export const openBusinessNotification = (props: ICustomNotification) => {
    const state = store.getState()
    const notificationMode = state.session.featureSettings?.find(
        featureSetting => featureSetting.key === EFeatureSettingKey.notificationMode
    )?.value

    const isStack = notificationMode === ENotificationMode.stack
    const max = notificationMode === ENotificationMode.single ? 1 : maxItems
    const key = props.key ?? `notification-${Date.now()}`

    if (notifications.size >= max) {
        const firstKey = notifications.values().next().value
        closeNotification(firstKey)
    }

    notifications.add(key)

    notification.open({
        ...props,
        key,
        duration: timeout,
        top: 64,
        className: cn(props.className, styles.businessNotice, {
            [styles.stack]: isStack,
            [styles.downward]: isDirectionDownward
        }),
        getContainer: () => document.getElementById(notificationsContainerId) || document.body,
        onClose: () => {
            notifications.delete(key)

            if (props.onClose) {
                props.onClose()
            }
        }
    })
}

export const closeNotification = (key: string) => {
    notification.close(key)
    notifications.delete(key)
}

export const closeAllNotifications = () => {
    notification.destroy()
    notifications.clear()
}
