import { actions } from '@actions'
import { PopupData as CorePopupData } from '@cxbox-ui/core'

export type FileViewerMode = 'onlyFullscreen'

export interface FileViewerPopupOptions {
    type: 'file-viewer'
    mode?: FileViewerMode
    bcName: string
    calleeFieldKey: string
    /**
     * The row shown by the preview, the arrows go through the rows from it. The row does not become active and the record form is not shown.
     * A mass operation opens the preview this way: its rows are only viewed. Without it the preview shows the active record.
     */
    recordId?: string
}

export interface CustomPopupOptions {
    operation?: ReturnType<typeof actions.processPreInvoke>['payload']
    calleeFieldKey?: string
}

export interface WsNotificationPopupOptions {
    type: 'ws-notification'
}

export interface PopupData extends CorePopupData {
    options?: CorePopupData['options'] & CustomPopupOptions & Partial<FileViewerPopupOptions | WsNotificationPopupOptions>
}
