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
import { keycloak, KEYCLOAK_MIN_VALIDITY } from '../../../keycloak'
import { EFeatureSettingKey } from '@interfaces/session'
import { EDrillDownTooltipValue } from '@components/ui/DrillDown/constants'
import { IFrame } from '@stomp/stompjs/src/i-frame'

const { ApplicationErrorType } = interfaces

const notificationClient = new Client({
    brokerURL: brokerURL,
    reconnectDelay: reconnectDelay,
    heartbeatIncoming: heartbeatIncoming,
    heartbeatOutgoing: heartbeatOutgoing,
    beforeConnect: (): Promise<void> => {
        return new Promise<void>(async (resolve, _) => {
            await keycloak.updateToken(KEYCLOAK_MIN_VALIDITY).then(() => {
                notificationClient.brokerURL = brokerURL + '?access_token=' + encodeURI(`${keycloak.token}`)
            })
            resolve()
        })
    }
})

export function useNotificationClient(subscribeCallback?: (messageBody: SocketNotification) => void) {
    const dispatch = useDispatch()

    const router = useAppSelector(state => state.router)
    const featureSettings = useAppSelector(state => state.session.featureSettings)
    const drillDownTooltipEnabled =
        featureSettings?.find(setting => setting.key === EFeatureSettingKey.drillDownTooltip)?.value === EDrillDownTooltipValue.newAndCopy
    const disableWebSocketNotification =
        featureSettings?.find(setting => setting.key === EFeatureSettingKey.webSocketNotificationEnabled)?.value === 'false'

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
            const { title, time, text, icon, iconColor, links, errorType } = messageBody

            if (checkAndShowErrorMessage(errorType as number, text)) {
                return
            }

            showSocketNotification({
                route: router,
                dispatch,
                time,
                links,
                message: title,
                description: text,
                icon,
                iconColor,
                duration: 0,
                drillDownTooltipEnabled
            })

            subscribeCallback?.(messageBody)
        })
    })

    const userId = useAppSelector(state => state.session.userId)

    useEffect(() => {
        if (!disableWebSocketNotification && !notificationClient.active && userId) {
            notificationClient.onConnect = frame => {
                handleStompConnectRef.current(frame, createUserSubscribeUrl(userId))
            }

            notificationClient.activate()
        }
    }, [disableWebSocketNotification, userId])

    return disableWebSocketNotification ? null : notificationClient
}
