import { ActionPostInvoke } from './common'

/**
 * File downloading by `fileId` which comes from answer.
 */
export interface ActionPostInvokeDownloadFile extends ActionPostInvoke {
    type: 'downloadFile'
    /**
     * Backend's file ID
     */
    fileId: string
}

export function isActionPostInvokeDownloadFile(postAction: ActionPostInvoke): postAction is ActionPostInvokeDownloadFile {
    return postAction.type === 'downloadFile'
}
