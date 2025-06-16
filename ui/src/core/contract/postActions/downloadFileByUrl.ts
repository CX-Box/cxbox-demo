import { ActionPostInvoke } from './common'

/**
 * File downloading by `url` which comes from answer.
 */
export interface ActionPostInvokeDownloadFileByUrl extends ActionPostInvoke {
    type: 'downloadFileByUrl'
    /**
     * File's URL
     */
    url: string
}

export function isActionPostInvokeDownloadFileByUrl(postAction: ActionPostInvoke): postAction is ActionPostInvokeDownloadFileByUrl {
    return postAction.type === 'downloadFileByUrl'
}
