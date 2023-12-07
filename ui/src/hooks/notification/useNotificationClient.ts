import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { AxiosError } from 'axios'
import { $do } from '../../actions/types'
import { ApplicationErrorType } from '@cxbox-ui/core/interfaces/view'
import showSocketNotification from '../../components/Notification/ShowSocketNotification'
import { getStoreInstance } from '@cxbox-ui/core'
import { brokerURL, heartbeatIncoming, heartbeatOutgoing, reconnectDelay } from '../../constants/notification'
import { Client } from '@stomp/stompjs'
import { SocketNotification } from '../../interfaces/notification'
import { createUserSubscribeUrl } from '../../utils/notification'
import { useAppSelector } from '../useAppSelector'
import { IFrame } from '@stomp/stompjs/src/i-frame'

const notificationClient = new Client({
    brokerURL: brokerURL,
    debug: function (str: string) {
        console.log(str)
    },
    reconnectDelay: reconnectDelay,
    heartbeatIncoming: heartbeatIncoming,
    heartbeatOutgoing: heartbeatOutgoing
})

export function useNotificationClient(subscribeCallback?: (messageBody: SocketNotification) => void) {
    const dispatch = useDispatch()

    const handleStompConnectRef = useRef<(frame: IFrame, subscribeUrl: string) => void>((frame, subscribeUrl) => {
        console.info('---->>>> Connect Success', frame)

        const checkAndShowErrorMessage = (errorType: number, text: any) => {
            if (errorType === 1) {
                dispatch(
                    $do.showViewError({
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
                    $do.showViewError({
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

            const storeInstance = getStoreInstance()

            showSocketNotification({
                route: storeInstance.getState().router,
                dispatch: storeInstance.dispatch,
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

            notificationClient.onStompError = frame => {
                console.error('---->>>> Stomp Error', frame)
            }

            notificationClient.onWebSocketError = event => {
                console.error('---->>>> WebSocket Error', event)
            }

            notificationClient.activate()
        }
    }, [userId])

    return notificationClient
}
