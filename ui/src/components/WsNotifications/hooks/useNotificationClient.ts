import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { AxiosError } from 'axios'
import { actions, interfaces } from '@cxbox-ui/core'
import showSocketNotification from '../ShowSocketNotification'
import { brokerURL, heartbeatIncoming, heartbeatOutgoing, reconnectDelay } from '@constants/notification'
import { Client } from '@stomp/stompjs'
import { SocketNotification } from '@interfaces/notification'
import { createUserSubscribeUrl } from '../utils'
import { useAppSelector } from '@store'
import { IFrame } from '@stomp/stompjs/src/i-frame'

const { ApplicationErrorType } = interfaces

const notificationClient = new Client({
    brokerURL: brokerURL,
    reconnectDelay: reconnectDelay,
    heartbeatIncoming: heartbeatIncoming,
    heartbeatOutgoing: heartbeatOutgoing
})

export function useNotificationClient(subscribeCallback?: (messageBody: SocketNotification) => void) {
    const router = useAppSelector(state => state.router)

    const dispatch = useDispatch()

    const handleStompConnectRef = useRef<(frame: IFrame, subscribeUrl: string) => void>((frame, subscribeUrl) => {
        const checkAndShowErrorMessage = (errorType: number, text: any) => {
            if (errorType === 1) {
                dispatch(
                    actions.showViewError({
                        error: {
                            type: ApplicationErrorType.SystemError,
                            error: { response: text } as AxiosError
                        }
                    })
                )

                return true
            }

            if (errorType === 0) {
                dispatch(
                    actions.showViewError({
                        error: {
                            type: ApplicationErrorType.BusinessError,
                            message: text
                        }
                    })
                )

                return true
            }

            return false
        }

        notificationClient.subscribe(subscribeUrl, message => {
            const messageBody = JSON.parse(message.body) as SocketNotification
            const { title, time, text, icon, iconColor, drillDownLink, drillDownType, drillDownLabel, errorType } = messageBody

            if (checkAndShowErrorMessage(errorType as number, text)) {
                return
            }

            showSocketNotification({
                route: router,
                dispatch,
                time,
                drillDownLink,
                drillDownType,
                drillDownLabel,
                message: title,
                description: text,
                icon,
                iconColor,
                duration: 0
            })

            subscribeCallback?.(messageBody)
        })
    })

    const userId = useAppSelector(state => state.session.userId)

    useEffect(() => {
        if (!notificationClient.active && userId) {
            notificationClient.onConnect = frame => {
                handleStompConnectRef.current(frame, createUserSubscribeUrl(userId))
            }

            notificationClient.activate()
        }
    }, [userId])

    return notificationClient
}
