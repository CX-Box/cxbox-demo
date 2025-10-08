import React, { useCallback, useEffect, useRef } from 'react'
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

    const containerRef = useRef<HTMLDivElement>(null)

    const onClose = useCallback(() => {
        dispatch(actions.closeNotification({ id }))
    }, [dispatch, id])

    useEffect(() => {
        if (!duration) {
            return
        }

        const timer = setTimeout(() => {
            if (containerRef?.current) {
                const closeBtn = containerRef.current.querySelector('.ant-alert-close-icon') as HTMLButtonElement

                if (closeBtn) {
                    closeBtn.click()
                } else {
                    onClose()
                }
            }
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    return (
        <div ref={containerRef}>
            <Alert message={message} type={type} closable afterClose={onClose} banner />
        </div>
    )
}

export default React.memo(SystemAlert)
