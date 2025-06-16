import { Action } from './common'

export interface AssociateAction extends Action {
    type: 'associate'
}

export function isActionAssociate(action: Action): action is AssociateAction {
    return action.type === 'associate'
}
