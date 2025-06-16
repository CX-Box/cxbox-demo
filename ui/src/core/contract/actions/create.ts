import { Action } from './common'

export interface CreateAction extends Action {
    type: 'create'
}

export function isActionCreate(action: Action): action is CreateAction {
    return action.type === 'create'
}
