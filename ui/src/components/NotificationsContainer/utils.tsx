import { notification } from 'antd'
import cn from 'classnames'
import { ArgsProps } from 'antd/lib/notification'
import {
    notifications,
    maxItems,
    notificationMode,
    directionItems,
    timeout,
    ENotificationMode,
    EDirection,
    notificationsContainerId
} from '@components/NotificationsContainer/constants'
import styles from './NotificationsContainer.module.css'

const max = notificationMode === ENotificationMode.single ? 1 : maxItems
const isDirectionDownward = directionItems === EDirection.downward
const isStack = notificationMode === ENotificationMode.stack

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
    const key = props.key || `notification-${Date.now()}`

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
