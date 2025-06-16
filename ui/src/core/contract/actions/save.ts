import { Action } from './common'

export interface SaveAction extends Action {
    type: 'save'
}

export function isActionSave(action: Action): action is SaveAction {
    return action.type === 'save'
}
