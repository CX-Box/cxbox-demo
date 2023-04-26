import React from 'react'
import { Alert } from 'antd'
import { AppNotificationType } from '@cxbox-ui/core/interfaces/objectMap'
import { useDispatch } from 'react-redux'
import { $do } from '../../../actions/types'

interface SystemAlertProps {
    id: number
    message: string
    type: AppNotificationType
}

function SystemAlert({ id, message, type }: SystemAlertProps) {
    const dispatch = useDispatch()
    const onClose = React.useCallback(() => {
        dispatch($do.closeNotification({ id }))
    }, [dispatch, id])
    return <Alert message={message} closable afterClose={onClose} type={type} banner />
}

export default React.memo(SystemAlert)
