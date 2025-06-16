import { ActionPreInvoke } from './common'

export interface ConfirmActionPreInvoke extends ActionPreInvoke {
    type: 'confirm'
    message: string
}

export function isActionPreInvokeConfirm(preAction: ActionPreInvoke): preAction is ConfirmActionPreInvoke {
    return preAction.type === 'confirm'
}
