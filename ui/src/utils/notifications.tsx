import React from 'react'
import { Button, notification } from 'antd'
import i18n from 'i18next'

/**
 * Shows antd notification with button
 *
 * @param description Notification message
 * @param buttonText Displayed text on button
 * @param duration How long notification will be shown
 * @param onButtonClick Button callback
 * @param key Used for updating existing notification instead of showing new one.
 * If omitted, following template will be used to generate unique key: `notification_${Date.now}`
 */
export const openButtonWarningNotification = (
    description: string,
    buttonText: string,
    duration = 0,
    onButtonClick?: () => void,
    key?: string
): string => {
    if (key?.length > 0) {
        notification.close(key)
    }

    const notificationKey = key ? key : `notification_${Date.now()}`
    const btnAction = () => {
        onButtonClick?.()
        notification.close(notificationKey)
    }
    const btn = (
        <Button type="primary" onClick={btnAction}>
            {buttonText}
        </Button>
    )

    notification.warning({
        description,
        duration,
        message: i18n.t('Attention'),
        btn,
        key: notificationKey
    })

    return key
}
