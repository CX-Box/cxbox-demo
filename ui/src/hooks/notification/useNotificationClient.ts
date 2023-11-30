import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { AxiosError } from 'axios'
import { $do } from '../../actions/types'
import { ApplicationErrorType } from '@cxbox-ui/core/interfaces/view'
import showSocketNotification from '../../components/Notification/ShowSocketNotification'
import { getStoreInstance } from '@cxbox-ui/core'
import { brokerURL, heartbeatIncoming, heartbeatOutgoing, reconnectDelay, subscribeUrl } from '../../constants/notification'
import { Client } from '@stomp/stompjs'
import { frameCallbackType } from '@stomp/stompjs/src/types'
import { SocketNotification } from '../../interfaces/notification'

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

    const handleStompConnectRef = useRef<frameCallbackType>(frame => {
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

    useEffect(() => {
        if (!notificationClient.active) {
            notificationClient.onConnect = frame => {
                handleStompConnectRef.current(frame)
            }

            notificationClient.onStompError = frame => {
                console.error('---->>>> Stomp Error', frame)
            }

            notificationClient.onWebSocketError = event => {
                console.error('---->>>> WebSocket Error', event)
            }

            notificationClient.activate()
        }
    }, [])

    return notificationClient
}
