import { UploadFileStatus } from 'antd/es/upload/interface'

export interface FileInfo {
    id: null | string
    status: 'init' | UploadFileStatus
    percent?: number
}
