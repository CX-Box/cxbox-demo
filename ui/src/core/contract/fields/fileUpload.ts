import { FieldMeta } from './common'

export interface FileUploadFieldMeta extends FieldMeta {
    type: 'fileUpload'
    fileIdKey: string
    fileSource: string
    snapshotFileIdKey?: string
    preview?: {
        /**
         * Enables file previews. Default false.
         */
        enabled: boolean
        /**
         * Key whose value is used for the popup title. If not specified, the file name is taken
         */
        titleKey?: string
        /**
         * The key whose value is used for the tooltip under the popup title. If not specified, the additional attribute is not shown.
         */
        hintKey?: string
        /**
         * Preview display mode: popup (default), side-panel.
         */
        mode?: 'popup' | 'side-panel'
        /**
         * Includes display of mini-previews for file types for which we can, for the rest there are icons with an eye.
         * The default is false (icons with an eye are shown for all files).
         * Where the value will come from is decided at the project level.
         */
        miniPreview?: boolean
    }
}

export function isFieldFileUpload(meta: FieldMeta): meta is FileUploadFieldMeta {
    return meta.type === 'fileUpload'
}
