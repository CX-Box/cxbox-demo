import React, { useCallback, useEffect } from 'react'
import { Alert } from 'antd'
import { useDispatch } from 'react-redux'
import { actions } from '@cxbox-ui/core'
import { interfaces } from '@cxbox-ui/core'

interface SystemAlertProps {
    id: number
    message: string
    type: interfaces.AppNotificationType
    duration: number
}

function SystemAlert({ id, message, type, duration }: SystemAlertProps) {
    const dispatch = useDispatch()

    const onClose = useCallback(() => {
        dispatch(actions.closeNotification({ id }))
    }, [dispatch, id])

    useEffect(() => {
        if (!duration) {
            return
        }

        const timer = setTimeout(() => {
            onClose()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    return <Alert message={message} closable afterClose={onClose} type={type} banner />
}

export default React.memo(SystemAlert)
