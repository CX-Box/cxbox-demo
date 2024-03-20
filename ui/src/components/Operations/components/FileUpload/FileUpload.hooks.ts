import { OperationInfo } from '@interfaces/widget'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

export const useFileUploadHint = (operationInfo?: OperationInfo) => {
    const { t } = useTranslation()

    const hintPermission = getFilePermissionFromAccept(operationInfo?.fileAccept)?.toUpperCase()

    return hintPermission ? t('Supports only format', { permission: hintPermission }) : ''
}

export const useBulkUploadFiles = (bcName: string, accept?: string) => {
    const [addedFileDictionary, setAddedFileDictionary] = useState<Record<string, AddedFileInfo>>({})
    const addedFileList = useMemo(() => Object.values(addedFileDictionary), [addedFileDictionary])
    const timeoutId = useRef<NodeJS.Timeout | null>(null)
    const { getStatusInformation } = useStatusesInformation(accept)

    const dispatch = useAppDispatch()

    const updateAddedFile = (uid: string, newFileInfo: Omit<Partial<AddedFileInfo>, 'uid'>) => {
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
    }

    const initializeNewAddedFile = (uid: string, fileName: string, uploadType?: string) => {
        updateAddedFile(uid, { id: null, status: 'init', name: fileName, uploadType })
    }

    const initializeNotSupportedFile = (fileName: string, uploadType?: string) => {
        const uid = `${fileName}-${Date.now()}`
        initializeNewAddedFile(uid, fileName, uploadType)

        setTimeout(() => {
            updateAddedFile(uid, {
                status: UPLOAD_FILE_STATUS.notSupportedExtension,
                percent: 100
            })
        }, 100)
    }

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

    const changeFileStatuses = useCallback(
        (from: keyof typeof UPLOAD_FILE_STATUS, to: keyof typeof UPLOAD_FILE_STATUS) => {
            setAddedFileDictionary(
                getAddedFileList().reduce((acc, addedFile) => {
                    if (addedFile.status === from) {
                        acc[addedFile.uid] = { ...addedFile, status: to }
                    } else {
                        acc[addedFile.uid] = addedFile
                    }

                    return acc
                }, {} as Record<string, AddedFileInfo>)
            )
        },
        [getAddedFileList]
    )

    const deleteFilesWithStatuses = useCallback(
        (statuses: (keyof typeof UPLOAD_FILE_STATUS | string)[] = []) => {
            setAddedFileDictionary(
                getAddedFileList().reduce((acc, addedFile) => {
                    if (!statuses.includes(addedFile.status)) {
                        acc[addedFile.uid] = addedFile
                    }

                    return acc
                }, {} as Record<string, AddedFileInfo>)
            )
        },
        [getAddedFileList]
    )

    const clearAddedFiles = useCallback(() => {
        setAddedFileDictionary({})
    }, [])

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

            timeoutId.current = setTimeout(() => {
                changeFileStatuses('done', 'updated')
                timeoutId.current = null
            }, 2000)
        }
    }, [dispatch, addedFileList, bcName, changeFileStatuses])

    useEffect(() => {
        if (addedFileList.some(file => file.status === 'init') && timeoutId.current) {
            clearTimeout(timeoutId.current)
            timeoutId.current = null
        }
    }, [addedFileList])

    return {
        updateAddedFile,
        initializeNewAddedFile,
        initializeNotSupportedFile,
        getAddedFile,
        getAddedFileList,
        getAddedFileListWithout,
        deleteFilesWithStatuses,
        clearAddedFiles
    }
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
            }
        },
        [accept, t]
    )

    return {
        getStatusInformation
    }
}
