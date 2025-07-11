import {
    PROGRESS_STATUS_COLOR,
    UPLOAD_FILE_STATUS,
    UPLOAD_TO_PROGRESS_STATUS_MAP
} from '@components/Operations/components/FileUpload/FileUpload.constants'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'

const { done, error, notSupportedExtension, uploading, init, canceled, removed } = UPLOAD_FILE_STATUS
type UploadFileStatus = keyof typeof UPLOAD_FILE_STATUS

export const isFileUploading = (fileStatus: UploadFileStatus | string | undefined) => {
    return ([init, uploading] as string[]).includes(fileStatus as string)
}

export const isFileUploadSuccess = (fileStatus: UploadFileStatus | string | undefined) => {
    return fileStatus === done
}

export const isFileException = (fileStatus: UploadFileStatus | string | undefined) => {
    return ([notSupportedExtension, error, canceled] as string[]).includes(fileStatus as string)
}

export const isFileUploadComplete = (fileStatus: UploadFileStatus | string | undefined) => {
    return isFileUploadSuccess(fileStatus) || isFileException(fileStatus)
}

export const needSendAllFiles = (filesInfo: AddedFileInfo[]) => {
    const filesExist = filesInfo.length !== 0
    const uploadingFilesContinues = filesInfo.some(filesInfo => {
        return filesInfo.status === 'init' || filesInfo.status === 'uploading'
    })
    const someDoneFilesExist = filesInfo.some(filesInfo => {
        return filesInfo.status === 'done'
    })

    return filesExist && someDoneFilesExist && !uploadingFilesContinues
}

export const addDotToExtension = (fileExtension: string) => {
    return fileExtension.startsWith('.') ? fileExtension : `.${fileExtension}`
}

export function getFileExtension(fileName: string | null = null) {
    const fileExtension = fileName ? (fileName.split('.').pop() as string) : String(fileName)

    return addDotToExtension(fileExtension)
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
    return filesInfo.filter(fileInfo => fileInfo.status === done && fileInfo.id).map(fileInfo => fileInfo.id as string)
}

export const convertUploadStatusToProgress = (fileStatus: UploadFileStatus | string | undefined) => {
    return UPLOAD_TO_PROGRESS_STATUS_MAP[fileStatus as UploadFileStatus] ?? UPLOAD_TO_PROGRESS_STATUS_MAP['default']
}

export const getProgressColorFromUploadStatus = (fileStatus: UploadFileStatus | string | undefined) => {
    return PROGRESS_STATUS_COLOR[convertUploadStatusToProgress(fileStatus) as keyof typeof PROGRESS_STATUS_COLOR]
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
