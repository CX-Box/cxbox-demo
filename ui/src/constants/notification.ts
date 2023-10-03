// TODO MY заменить url и маппинг

import { __WS_API__ } from './constants'

export const brokerURL = __WS_API__
export const subscribeUrl = '/user/queue/websocket.reply'

export const reconnectDelay = 5000
export const heartbeat = 4000
export const heartbeatIncoming = heartbeat
export const heartbeatOutgoing = heartbeat

export const fileControllerMapping = 'file'
