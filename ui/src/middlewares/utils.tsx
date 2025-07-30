import { Button, notification } from 'antd'
import React from 'react'
import { t } from 'i18next'
import { openNotification as openNotificationDefault } from '@components/NotificationsContainer/utils'

export interface OpenNotificationType {
    key?: string
    message?: string
    description?: string
    okText?: string
    cancelText?: string
    onCancel?: () => void
    onOk?: () => void
}

const openNotification = ({ message, description, okText, cancelText, onOk, onCancel, key }: OpenNotificationType = {}) => {
    const notificationKey = key ?? `open${Date.now()}`

    notification.close(notificationKey)

    const buttons = (
        <div style={{ display: 'flex', gap: 20 }}>
            <Button
                type="link"
                size="small"
                onClick={() => {
                    onOk?.()
                    notification.close(notificationKey)
                }}
            >
                {okText}
            </Button>

            <Button
                type="primary"
                size="small"
                onClick={() => {
                    onCancel?.()
                    notification.close(notificationKey)
                }}
            >
                {cancelText}
            </Button>
        </div>
    )

    setTimeout(() => {
        openNotificationDefault({
            duration: null,
            message,
            description,
            btn: buttons,
            key: notificationKey,
            style: {
                width: 'auto',
                minWidth: 384
            }
        })
    }, 100)
}

export const showUnsavedNotification = (onOk?: () => void, onCancel?: () => void) => {
    return openNotification({
        key: 'unsaved notification',
        okText: t('Save'),
        cancelText: t('Cancel'),
        message: t('There is unsaved data, save it?'),
        description: '',
        onOk,
        onCancel
    })
}
