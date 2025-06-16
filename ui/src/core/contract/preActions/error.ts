import { ActionPreInvoke } from './common'

export interface ErrorActionPreInvoke extends ActionPreInvoke {
    type: 'error'
    message: string
}

export function isActionPreInvokeError(preAction: ActionPreInvoke): preAction is ErrorActionPreInvoke {
    return preAction.type === 'error'
}
