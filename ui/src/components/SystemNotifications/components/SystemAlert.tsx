import React from 'react'
import { Alert } from 'antd'
import { AppNotificationType } from '@cxbox-ui/core/interfaces/objectMap'
import { useAppDispatch } from '@store'
import { closeNotification } from '@cxbox-ui/core/actions'

interface SystemAlertProps {
    id: number
    message: string
    type: AppNotificationType
}

function SystemAlert({ id, message, type }: SystemAlertProps) {
    const dispatch = useAppDispatch()
    const onClose = React.useCallback(() => {
        dispatch(closeNotification({ id }))
    }, [dispatch, id])
    return <Alert message={message} closable afterClose={onClose} type={type} banner />
}

export default React.memo(SystemAlert)
