import { actions } from '@actions'
import { PopupData as CorePopupData } from '@cxbox-ui/core'

export interface FileViewerPopupOptions {
    type: 'file-viewer'
    calleeFieldKey: string
}

export interface CustomPopupOptions {
    operation?: ReturnType<typeof actions.processPreInvoke>['payload']
    calleeFieldKey?: string
}

export interface PopupData extends CorePopupData {
    options?: CustomPopupOptions & Partial<FileViewerPopupOptions>
}
