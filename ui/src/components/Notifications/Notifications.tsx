import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { interfaces } from '@cxbox-ui/core'
import { IconType } from 'antd/es/notification'
import { useTranslation } from 'react-i18next'
import { openButtonWarningNotification } from './Notifications.utils'
import { useNotifications } from './Notifications.hooks'
import { openNotification } from '@components/NotificationsContainer/utils'

export function Notifications() {
    const { currentNotifications, notificationsDuration } = useNotifications()
    const { t } = useTranslation()
    const dispatch = useDispatch()

    useEffect(() => {
        if (!currentNotifications.length) {
            return
        }

        currentNotifications.forEach(currentNotification => {
            const duration = currentNotification.duration || notificationsDuration
            console.log({ duration })
            if (isDefaultNotification(currentNotification)) {
                const message = t(currentNotification.message, currentNotification.options?.messageOptions)
                const description = typeof currentNotification.description === 'string' ? t(currentNotification.description) : undefined
                openNotification({
                    type: currentNotification.type as IconType,
                    key: currentNotification.key,
                    message,
                    description,
                    duration
                })
            }

            if (isButtonWarningNotification(currentNotification)) {
                console.log({ duration: currentNotification.duration })
                const buttonText = currentNotification.options?.buttonWarningNotificationOptions?.buttonText ?? ''
                const actionsForClick = currentNotification.options?.buttonWarningNotificationOptions?.actionsForClick ?? []
                const handleButtonClick =
                    actionsForClick.length > 0
                        ? () => {
                              actionsForClick.forEach(action => dispatch(action))
                          }
                        : undefined

                openButtonWarningNotification(
                    t('Attention'),
                    t(currentNotification.message, currentNotification.options?.messageOptions),
                    t(buttonText),
                    duration,
                    handleButtonClick,
                    currentNotification.key
                )
            }
        })
    }, [currentNotifications, dispatch, t])

    return <></>
}

export default Notifications

const isButtonWarningNotification = (notification: interfaces.Notification) => {
    return 'buttonWarningNotification' === notification.type
}

const defaultNotificationTypes = ['success', 'error', 'info', 'warning']

const isDefaultNotification = (notification: interfaces.Notification) => {
    return defaultNotificationTypes.includes(notification.type)
}
