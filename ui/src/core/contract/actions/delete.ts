import { Action } from './common'

export interface DeleteAction extends Action {
    type: 'delete'
}

export function isActionDelete(action: Action): action is DeleteAction {
    return action.type === 'delete'
}
