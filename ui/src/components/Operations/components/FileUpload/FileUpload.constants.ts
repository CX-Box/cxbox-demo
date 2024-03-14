import { UploadFileStatus } from 'antd/es/upload/interface'
import { ProgressProps } from 'antd/lib/progress/progress'

export const UPLOAD_FILE_STATUS: Record<UploadFileStatus, UploadFileStatus | string> = {
    done: 'done',
    uploading: 'uploading',
    error: 'error',
    removed: 'removed',
    success: 'success'
}

export const UPLOAD_TO_PROGRESS_STATUS_MAP: Record<string, ProgressProps['status']> = {
    [UPLOAD_FILE_STATUS.uploading]: 'active',
    [UPLOAD_FILE_STATUS.error]: 'exception',
    [UPLOAD_FILE_STATUS.done]: 'success'
}
