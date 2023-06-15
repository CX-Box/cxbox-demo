import { Button, notification } from 'antd'
import React from 'react'

export interface OpenNotificationType {
    message?: string
    description?: string
    okText?: string
    cancelText?: string
    onCancel?: () => void
    onOk?: () => void
}

export const openNotification = ({ message, description, okText, cancelText, onOk, onCancel }: OpenNotificationType = {}) => {
    const key = `open${Date.now()}`

    const buttons = (
        <div style={{ display: 'flex', gap: 20 }}>
            <Button
                type="link"
                size="small"
                onClick={() => {
                    onOk?.()
                    notification.close(key)
                }}
            >
                {okText}
            </Button>
            <Button
                type="primary"
                size="small"
                onClick={() => {
                    onCancel?.()
                    notification.close(key)
                }}
            >
                {cancelText}
            </Button>
        </div>
    )

    notification.open({
        duration: null,
        message,
        description,
        btn: buttons,
        key
    })
}
