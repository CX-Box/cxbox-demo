import { __WS_API__ } from './constants'

export const brokerURL = `${__WS_API__}websocketnotification`

export const reconnectDelay = 2000
export const heartbeat = 4000
export const heartbeatIncoming = heartbeat
export const heartbeatOutgoing = heartbeat

export const fileControllerMapping = 'file'
