import { __WS_API__ } from '../constants'

export const brokerURL = `${__WS_API__}websocketnotification`

export const reconnectDelay = 2000
/**
 * The delay between reconnects doubles after every failed attempt up to this value (see `useNotificationClient`),
 * so a websocket that cannot connect does not knock every 2 seconds for hours
 */
export const maxReconnectDelay = 30000
export const heartbeat = 4000
export const heartbeatIncoming = heartbeat
export const heartbeatOutgoing = heartbeat

export const fileControllerMapping = 'file'
