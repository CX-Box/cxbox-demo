import { ActionPostInvoke } from './common'

/**
 * `Pick list` widget opening
 */
export interface ActionPostInvokeOpenPickList extends ActionPostInvoke {
    type: 'openPickList'
    /**
     * BC name of pick list widget
     */
    pickList: string
}

export function isActionPostInvokeOpenPickList(postAction: ActionPostInvoke): postAction is ActionPostInvokeOpenPickList {
    return postAction.type === 'openPickList'
}
