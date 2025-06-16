import { ActionPostInvoke } from './common'

/**
 * The type of message that will be shown to the user for confirmation
 */
type ConfirmType =
    /**
     * Simple confirmation
     */
    | 'confirm'
    /**
     * Сonfirmation with text from the user
     */
    | 'confirmText'

/**
 * The action that will be performed after the user confirms it
 */
export interface ActionPostInvokeConfirm extends ActionPostInvoke {
    /**
     * Type of postInvokeConfirm action
     */
    type: ConfirmType
    /**
     * Body text of a modal actually
     * TODO 2.0.0 rename correctly
     */
    message: string
    /**
     * Custom modal title actually
     * TODO 2.0.0 rename correctly
     */
    messageContent?: string
    /**
     * Custom label of OK button
     */
    okText?: string
    /**
     * Custom label of Cancel button
     */
    cancelText?: string
}

export function isActionPostInvokeConfirm(postAction: ActionPostInvoke): postAction is ActionPostInvokeConfirm {
    return postAction.type === 'confirm' || postAction.type === 'confirmText'
}
