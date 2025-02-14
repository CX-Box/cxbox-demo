import { Button, notification } from 'antd'
import React from 'react'

export interface OpenNotificationType {
    key?: string
    message?: string
    description?: string
    okText?: string
    cancelText?: string
    onCancel?: () => void
    onOk?: () => void
}

export const openNotification = ({ message, description, okText, cancelText, onOk, onCancel, key }: OpenNotificationType = {}) => {
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
        notification.open({
            duration: null,
            message,
            description,
            btn: buttons,
            key: notificationKey
        })
    }, 100)
}

const TEXTS_FOR_UNSAVED_NOTIFICATION: Omit<OpenNotificationType, 'onOk' | 'onCancel'> = {
    key: 'unsaved notification',
    okText: 'Save',
    cancelText: 'Cancel',
    message: 'There is unsaved data, save it ?',
    description: ''
}

export const showUnsavedNotification = (onOk?: () => void, onCancel?: () => void) => {
    return openNotification({
        ...TEXTS_FOR_UNSAVED_NOTIFICATION,
        onOk,
        onCancel
    })
}
