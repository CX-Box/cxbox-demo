import { __WS_API__ } from './api'

export const brokerURL = `${__WS_API__}websocketnotification`

export const reconnectDelay = 2000
/**
 * The reconnect delay doubles up to this value: a websocket that cannot connect
 * should not knock every 2 seconds for hours
 */
export const maxReconnectDelay = 30000
export const heartbeat = 4000
export const heartbeatIncoming = heartbeat
export const heartbeatOutgoing = heartbeat

export const fileControllerMapping = 'file'
