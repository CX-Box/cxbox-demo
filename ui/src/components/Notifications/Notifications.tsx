import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '@interfaces/storeSlices'
import { $do } from '@actions/types'
import { notification } from 'antd'
import { Notification } from '@cxbox-ui/core'
import { IconType } from 'antd/es/notification'
import { useTranslation } from 'react-i18next'
import { openButtonWarningNotification } from '@utils/notifications'

export function Notifications() {
    const { currentNotifications } = useNotifications()
    const { t } = useTranslation()
    const dispatch = useDispatch()

    useEffect(() => {
        if (!currentNotifications.length) {
            return
        }

        currentNotifications.forEach(currentNotification => {
            if (isDefaultNotification(currentNotification)) {
                notification[currentNotification.type as IconType]({
                    key: currentNotification.key,
                    message: currentNotification.message,
                    duration: currentNotification.duration
                })
            }

            if (isButtonWarningNotification(currentNotification)) {
                const buttonText = currentNotification.options?.buttonWarningNotificationOptions?.buttonText
                const actionsForClick = currentNotification.options?.buttonWarningNotificationOptions?.actionsForClick
                const handleButtonClick =
                    actionsForClick?.length > 0
                        ? () => {
                              actionsForClick.forEach(action => dispatch(action))
                          }
                        : null

                openButtonWarningNotification(
                    currentNotification.message,
                    buttonText,
                    currentNotification.duration,
                    handleButtonClick,
                    currentNotification.key
                )
            }
        })
    }, [currentNotifications, dispatch, t])

    return <></>
}

export default Notifications

const isButtonWarningNotification = (notification: Notification) => {
    return 'buttonWarningNotification' === notification.type
}

const defaultNotificationTypes = ['success', 'error', 'info', 'warning']

const isDefaultNotification = (notification: Notification) => {
    return defaultNotificationTypes.includes(notification.type)
}

const getUnusedNotifications = (newNotifications: Notification[], currentNotifications: Notification[]) => {
    return newNotifications.filter(
        newNotification => !currentNotifications.find(currentNotification => currentNotification.key === newNotification.key)
    )
}

/**
 * Этот хук отвечает за отображение уведомлений приложения.
 * Связан с двумя действиями: addNotification, removeNotifications.
 *
 * Логика работы:
 * После добавления уведомления в глобальное состояние,
 * идет проверка использовались ли они и сохраняются локально не использованные.
 * После того как мы их сохранили, у нас запустится хук которые удалит все используемые уведомления (локально и глобально).
 *
 * В промежуток после добавления и перед удалением у пользователя будет доступ ко всем нужным уведомлениям для отображения.
 *
 */
function useNotifications() {
    const notifications = useSelector((state: AppState) => state.session.notifications)
    const [currentNotifications, setCurrentNotifications] = useState<typeof notifications>([])

    useEffect(() => {
        if (notifications.length) {
            setCurrentNotifications(getUnusedNotifications(notifications, currentNotifications))
        }
    }, [currentNotifications, notifications])

    const dispatch = useDispatch()

    const removeNotifications = useCallback(
        (notificationKeys: string[]) => {
            dispatch($do.removeNotifications(notificationKeys))
            setCurrentNotifications([])
        },
        [dispatch]
    )

    useEffect(() => {
        if (currentNotifications.length) {
            removeNotifications(currentNotifications.map(item => item.key))
        }
    }, [currentNotifications, removeNotifications])

    return {
        currentNotifications
    }
}
