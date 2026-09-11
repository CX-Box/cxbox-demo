import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { AxiosError } from 'axios'
import { actions, interfaces } from '@cxbox-ui/core'
import showSocketNotification from '../ShowSocketNotification'
import { brokerURL, heartbeatIncoming, heartbeatOutgoing, maxReconnectDelay, reconnectDelay } from '@constants/notification'
import { Client, IFrame } from '@stomp/stompjs'
import { SocketNotification } from '@interfaces/notification'
import { createUserSubscribeUrl } from '../utils'
import { store, useAppSelector } from '@store'
import { EFeatureSettingKey } from '@interfaces/session'
import { EDrillDownTooltipValue } from '@components/ui/DrillDown/constants'
import { showAuthErrorPopup } from '@actions'
import { AUTH_ERROR_MODE } from '@constants'
import { Auth } from '../../../auth'
import { freshUser } from '../../../auth/tokenRenewal'
import { isAuthErrorSnoozed } from '../../../reducers/session'

const { ApplicationErrorType } = interfaces

let retryTimer: ReturnType<typeof setTimeout> | undefined

/**
 * The handshake token is taken the way a request takes it: the stored one, or the shared renewal of `auth/tokenRenewal.ts`
 * (a `signinSilent()` of its own would race with the interceptor and the other tabs, https://github.com/authts/oidc-client-ts/issues/1618).
 * Without a valid token (the session is over, the OIDC provider is down) the handshake is skipped and tried again after the
 * reconnect delay, which doubles up to `maxReconnectDelay` (stompjs 7.0 has no backoff of its own); the "Sign in again?" popup
 * is shown as for a failed request. The client keeps trying until a token is available again, it stops only after a logout.
 */
const notificationClient = new Client({
    brokerURL: brokerURL,
    reconnectDelay: reconnectDelay,
    heartbeatIncoming: heartbeatIncoming,
    heartbeatOutgoing: heartbeatOutgoing,
    beforeConnect: async () => {
        if (!store.getState().session.active) {
            await notificationClient.deactivate()
            return
        }
        const startedAt = new Date().toISOString()
        try {
            // legacy: the token as stored, even an expired one, as before 3.0.2
            const user = AUTH_ERROR_MODE === 'legacy' ? await Auth.getInstance().getUser() : await freshUser()

            if (user && user.access_token) {
                notificationClient.brokerURL = brokerURL + '?access_token=' + encodeURI(user.access_token)
            }
        } catch (error) {
            const delay = backOff()
            console.warn(
                `Websocket handshake skipped: no valid token (the session is over or the OIDC provider is unreachable), next attempt in ${
                    delay / 1000
                }s`,
                error
            )
            await notificationClient.deactivate()
            retryTimer = setTimeout(() => notificationClient.activate(), delay)
            if (!isAuthErrorSnoozed(store.getState().session)) {
                store.dispatch(
                    showAuthErrorPopup({
                        statusCode: 401,
                        method: 'CONNECT',
                        url: brokerURL,
                        startedAt,
                        finishedAt: new Date().toISOString()
                    })
                )
            }
        }
    },
    onWebSocketClose: backOff
})

function backOff() {
    notificationClient.reconnectDelay = Math.min(notificationClient.reconnectDelay * 2, maxReconnectDelay)
    return notificationClient.reconnectDelay
}

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
                notificationClient.reconnectDelay = reconnectDelay
                handleStompConnectRef.current(frame, createUserSubscribeUrl(userId))
            }

            notificationClient.activate()
        }
    }, [disableWebSocketNotification, userId])

    // after a logout (the layout unmounts) the client must not go on reconnecting with the token of a dead session
    useEffect(
        () => () => {
            clearTimeout(retryTimer)
            void notificationClient.deactivate()
        },
        []
    )

    return disableWebSocketNotification ? null : notificationClient
}
