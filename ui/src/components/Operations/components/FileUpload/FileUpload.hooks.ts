import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'
import { useAppDispatch } from '@store'
import {
    getDoneIdsFromFilesInfo,
    getFileExtension,
    getFilePermissionFromAccept,
    needSendAllFiles
} from '@components/Operations/components/FileUpload/FileUpload.utils'
import { actions } from '@cxbox-ui/core'
import { UPLOAD_FILE_STATUS, UPLOAD_TYPE } from '@components/Operations/components/FileUpload/FileUpload.constants'
import { UploadFileStatus } from 'antd/es/upload/interface'

export const useFileUploadHint = (accept?: string) => {
    const { t } = useTranslation()

    const hintPermission = getFilePermissionFromAccept(accept)?.toUpperCase()

    return hintPermission ? t('Supports only format', { permission: hintPermission }) : ''
}

export const useStatusesInformation = (accept?: string) => {
    const { t } = useTranslation()

    const getStatusInformation = useCallback(
        ({
            fileName,
            fileStatus,
            uploadType
        }: { fileName?: string; fileStatus?: AddedFileInfo['status']; uploadType?: AddedFileInfo['uploadType'] } = {}) => {
            if (fileStatus === UPLOAD_FILE_STATUS.done) {
                return uploadType === UPLOAD_TYPE.create
                    ? t('Success. File loaded and new row created')
                    : t('Success. File loaded to current row')
            } else if (fileStatus === UPLOAD_FILE_STATUS.error) {
                return uploadType === UPLOAD_TYPE.create
                    ? t('Error. File not loaded and no new row created')
                    : t('Error. File not loaded to current row')
            } else if (fileStatus === UPLOAD_FILE_STATUS.notSupportedExtension) {
                return t('Skipped. File has unsupported format', {
                    format: getFileExtension(fileName)?.toLowerCase(),
                    listOfFormats: getFilePermissionFromAccept(accept)?.toLowerCase()
                })
            } else if (fileStatus === UPLOAD_FILE_STATUS.canceled) {
                return t('Skipped. The file upload was cancelled because a new file was added')
            }
        },
        [accept, t]
    )

    return {
        getStatusInformation
    }
}

export const useUploadFilesInfo = (accept?: string) => {
    const [addedFileDictionary, setAddedFileDictionary] = useState<Record<string, AddedFileInfo>>({})
    const addedFileList = useMemo(() => Object.values(addedFileDictionary), [addedFileDictionary])
    const { getStatusInformation } = useStatusesInformation(accept)

    const updateAddedFile = useCallback(
        (uid: string, newFileInfo: Omit<Partial<AddedFileInfo>, 'uid'>) => {
            setAddedFileDictionary(addedFileDictionary => {
                const updatedFileInfo: AddedFileInfo = {
                    ...addedFileDictionary[uid],
                    ...newFileInfo
                }

                return {
                    ...addedFileDictionary,
                    [uid]: {
                        ...updatedFileInfo,
                        statusInformation: getStatusInformation({
                            fileStatus: updatedFileInfo.status,
                            fileName: updatedFileInfo.name,
                            uploadType: updatedFileInfo.uploadType
                        }),
                        uid
                    }
                }
            })
        },
        [getStatusInformation]
    )

    const initializeNewAddedFile = useCallback(
        (uid: string, fileName: string, uploadType?: string) => {
            updateAddedFile(uid, { id: null, status: 'init', name: fileName, uploadType })
        },
        [updateAddedFile]
    )

    const initializeNotSupportedFile = useCallback(
        (fileName: string, uploadType?: string) => {
            const uid = `${fileName}-${Date.now()}`
            initializeNewAddedFile(uid, fileName, uploadType)

            setTimeout(() => {
                updateAddedFile(uid, {
                    status: UPLOAD_FILE_STATUS.notSupportedExtension,
                    percent: 100
                })
            }, 100)
        },
        [initializeNewAddedFile, updateAddedFile]
    )

    const getAddedFile = (uid: string) => {
        return addedFileDictionary[uid]
    }

    const getAddedFileList = useCallback(
        (statuses?: AddedFileInfo['status'][]) => {
            if (!statuses?.length) {
                return addedFileList
            }

            return addedFileList.filter(addedFile => statuses.includes(addedFile.status))
        },
        [addedFileList]
    )

    const getAddedFileListWithout = useCallback(
        (statuses?: AddedFileInfo['status'][]) => {
            if (!statuses?.length) {
                return addedFileList
            }

            return addedFileList.filter(addedFile => !statuses.includes(addedFile.status))
        },
        [addedFileList]
    )

    const changeFileStatuses = useCallback((from: keyof typeof UPLOAD_FILE_STATUS, to: keyof typeof UPLOAD_FILE_STATUS) => {
        setAddedFileDictionary(fileDictionary =>
            Object.values(fileDictionary).reduce((acc, addedFile) => {
                if (addedFile.status === from) {
                    acc[addedFile.uid] = { ...addedFile, status: to }
                } else {
                    acc[addedFile.uid] = addedFile
                }

                return acc
            }, {} as Record<string, AddedFileInfo>)
        )
    }, [])

    const clearAddedFiles = useCallback((statuses?: (keyof typeof UPLOAD_FILE_STATUS | UploadFileStatus)[]) => {
        if (!statuses) {
            setAddedFileDictionary({})
        } else {
            setAddedFileDictionary(fileDictionary =>
                Object.values(fileDictionary).reduce((acc, addedFile) => {
                    if (!statuses.includes(addedFile.status)) {
                        acc[addedFile.uid] = addedFile
                    }

                    return acc
                }, {} as Record<string, AddedFileInfo>)
            )
        }
    }, [])

    const removeAddedFiles = useCallback((uidList: string[]) => {
        setAddedFileDictionary(addedFileDictionary => {
            const newDictionary = { ...addedFileDictionary }

            uidList.forEach(uid => delete newDictionary[uid])

            return newDictionary
        })
    }, [])

    return {
        updateAddedFile,
        initializeNewAddedFile,
        initializeNotSupportedFile,
        getAddedFile,
        getAddedFileList,
        getAddedFileListWithout,
        clearAddedFiles,
        changeFileStatuses,
        removeAddedFiles
    }
}

export const useBulkUploadFiles = (bcName: string, accept?: string) => {
    const { getAddedFileList, changeFileStatuses, ...rest } = useUploadFilesInfo(accept)
    const addedFileList = getAddedFileList()

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (needSendAllFiles(addedFileList) && bcName) {
            const fileIdList = getDoneIdsFromFilesInfo(addedFileList)

            dispatch(
                actions.bulkUploadFiles({
                    isPopup: false,
                    bcName: bcName,
                    fileIds: fileIdList
                })
            )
        }
    }, [dispatch, addedFileList, bcName, changeFileStatuses])

    return {
        ...rest,
        getAddedFileList
    }
}
