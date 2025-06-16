import { Action } from './common'

export interface FileUploadAction extends Action {
    type: 'fileUpload'
}

export function isActionFileUpload(action: Action): action is FileUploadAction {
    return action.type === 'fileUpload'
}
