import { ActionPreInvoke } from './common'

export interface InfoActionPreInvoke extends ActionPreInvoke {
    type: 'info'
    message: string
}

export function isActionPreInvokeInfo(preAction: ActionPreInvoke): preAction is InfoActionPreInvoke {
    return preAction.type === 'info'
}
