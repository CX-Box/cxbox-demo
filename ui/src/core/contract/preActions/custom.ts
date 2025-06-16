import { ActionPreInvoke } from './common'

export interface CustomActionPreInvoke extends ActionPreInvoke {
    type: 'custom'
    subtype: 'confirmWithCustomWidget'
    message?: string
    noText?: string
    yesText?: string
    widget?: string
}

export function isActionPreInvokeCustom(preAction: ActionPreInvoke): preAction is CustomActionPreInvoke {
    return preAction.type === 'custom'
}
