import { UPLOAD_FILE_STATUS } from '@components/Operations/components/FileUpload/FileUpload.constants'
import { UploadFileStatus } from 'antd/es/upload/interface'

export interface AddedFileInfo {
    uid: string
    id: null | string
    status: keyof typeof UPLOAD_FILE_STATUS | UploadFileStatus
    uploadType?: string
    statusInformation?: string
    percent?: number
    name: string
}
