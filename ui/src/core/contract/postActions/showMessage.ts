import { ActionPostInvoke } from './common'
import { AppNotificationType } from '../common'

/**
 * Pop-up message showing
 */
export interface ActionPostInvokeShowMessage extends ActionPostInvoke {
    type: 'showMessage'
    /**
     * A type of a message
     */
    messageType: AppNotificationType
    /**
     * A text of a message
     */
    messageText: string
}

export function isActionPostInvokeShowMessage(postAction: ActionPostInvoke): postAction is ActionPostInvokeShowMessage {
    return postAction.type === 'showMessage'
}
