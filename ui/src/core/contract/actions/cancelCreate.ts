import { Action } from './common'

export interface CancelCreateAction extends Action {
    type: 'cancel-create'
}

export function isActionCancelCreate(action: Action): action is CancelCreateAction {
    return action.type === 'cancel-create'
}
