import { UploadFileStatus } from 'antd/es/upload/interface'
import { UPLOAD_FILE_STATUS, UPLOAD_TO_PROGRESS_STATUS_MAP } from '@components/Operations/components/FileUpload/FileUpload.constants'
import { FileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'

const { done, error } = UPLOAD_FILE_STATUS

export const isFileDownloadComplete = (fileStatus: string | UploadFileStatus | undefined) => {
    return [error, done].includes(fileStatus as string)
}

export const isFileDownloadSuccess = (fileStatus: string | UploadFileStatus | undefined) => {
    return fileStatus === done
}

export const isFileDownloadError = (fileStatus: string | UploadFileStatus | undefined) => {
    return fileStatus === error
}

export const needSendAllFiles = (filesInfo: FileInfo[]) => {
    return filesInfo.length !== 0 && filesInfo.every(filesInfo => isFileDownloadComplete(filesInfo.status as UploadFileStatus))
}

export const getDoneIdsFromFilesInfo = (filesInfo: FileInfo[]) => {
    return filesInfo.filter(fileInfo => fileInfo.status === 'done' && fileInfo.id).map(fileInfo => fileInfo.id as string)
}

export const convertUploadStatusToProgress = (fileStatus: string | UploadFileStatus | undefined) => {
    return UPLOAD_TO_PROGRESS_STATUS_MAP[fileStatus as string] ?? 'normal'
}
