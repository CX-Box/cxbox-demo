import { ActionPostInvoke } from './common'

/**
 * BC's refresh. It leads to cursor dropping, data.ts refresh of current BC and its children
 */
export interface ActionPostInvokeRefreshBc extends ActionPostInvoke {
    type: 'refreshBC'
    /**
     * BC's name
     */
    bc: string
}

export function isActionPostInvokeRefreshBc(postAction: ActionPostInvoke): postAction is ActionPostInvokeRefreshBc {
    return postAction.type === 'refreshBC'
}
