import {
    PROGRESS_STATUS_COLOR,
    UPLOAD_FILE_STATUS,
    UPLOAD_TO_PROGRESS_STATUS_MAP,
    UPLOAD_TYPE_ICON
} from '@components/Operations/components/FileUpload/FileUpload.constants'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'

const { done, error, notSupportedExtension } = UPLOAD_FILE_STATUS
type UploadFileStatus = keyof typeof UPLOAD_FILE_STATUS

export const isFileDownloadComplete = (fileStatus: UploadFileStatus | string | undefined) => {
    return isFileDownloadSuccess(fileStatus) || isFileDownloadError(fileStatus)
}

export const isFileDownloadSuccess = (fileStatus: UploadFileStatus | string | undefined) => {
    return fileStatus === done
}

export const isFileDownloadError = (fileStatus: UploadFileStatus | string | undefined) => {
    return fileStatus === error
}

export const isFileException = (fileStatus: UploadFileStatus | string | undefined) => {
    return isFileDownloadError(fileStatus) || fileStatus === notSupportedExtension
}

export const needSendAllFiles = (filesInfo: AddedFileInfo[]) => {
    return (
        filesInfo.length !== 0 &&
        !filesInfo.some(filesInfo => {
            return filesInfo.status === 'init' || filesInfo.status === 'uploading'
        }) &&
        filesInfo.some(filesInfo => {
            return filesInfo.status === 'done'
        })
    )
}

export function getFileExtension(fileName: string | null = null) {
    const fileExtension = fileName ? (fileName.split('.').pop() as string) : String(fileName)

    return `.${fileExtension}`
}

export function checkFileFormat(fileName: string, accept?: string) {
    if (!accept) {
        return true
    }

    const allowedFormats = accept?.toLowerCase().split(',')
    const fileFormat = (fileName.split('.').pop() as string)?.toLowerCase()

    return allowedFormats?.includes(`.${fileFormat}`)
}

export const getDoneIdsFromFilesInfo = (filesInfo: AddedFileInfo[]) => {
    return filesInfo.filter(fileInfo => fileInfo.status === 'done' && fileInfo.id).map(fileInfo => fileInfo.id as string)
}

export const convertUploadStatusToProgress = (fileStatus: UploadFileStatus | string | undefined) => {
    return UPLOAD_TO_PROGRESS_STATUS_MAP[fileStatus as UploadFileStatus] ?? UPLOAD_TO_PROGRESS_STATUS_MAP['default']
}

export const getProgressColorFromUploadStatus = (fileStatus: UploadFileStatus | string | undefined) => {
    return PROGRESS_STATUS_COLOR[convertUploadStatusToProgress(fileStatus) as keyof typeof PROGRESS_STATUS_COLOR]
}

export const getProgressIcon = (uploadType: keyof typeof UPLOAD_TYPE_ICON | string | undefined) => {
    return UPLOAD_TYPE_ICON[uploadType as keyof typeof UPLOAD_TYPE_ICON]
}

export const getFilePermissionFromAccept = (accept?: string) => {
    return accept
        ?.split(',')
        ?.map(item => item.slice(1))
        ?.join(', ')
}

export const getFilesFromDataTransfer = (dataTransfer: DataTransfer) => {
    return dataTransfer.items
        ? [...dataTransfer.items].reduce((acc, item) => {
              if (item.kind === 'file') {
                  const file = item.getAsFile()
                  file && acc.push(file)
              }

              return acc
          }, [] as File[])
        : [...dataTransfer.files]
}
