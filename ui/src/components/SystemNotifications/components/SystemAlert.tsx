import React from 'react'
import { Alert } from 'antd'
import { useDispatch } from 'react-redux'
import { actions } from '@cxbox-ui/core'
import { interfaces } from '@cxbox-ui/core'

interface SystemAlertProps {
    id: number
    message: string
    type: interfaces.AppNotificationType
}

function SystemAlert({ id, message, type }: SystemAlertProps) {
    const dispatch = useDispatch()
    const onClose = React.useCallback(() => {
        dispatch(actions.closeNotification({ id }))
    }, [dispatch, id])
    return <Alert message={message} closable afterClose={onClose} type={type} banner />
}

export default React.memo(SystemAlert)
