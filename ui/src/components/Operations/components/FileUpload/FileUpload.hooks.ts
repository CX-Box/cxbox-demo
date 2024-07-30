import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'
import { useAppDispatch } from '@store'
import {
    getDoneIdsFromFilesInfo,
    getFileExtension,
    getFilePermissionFromAccept,
    isFileUploadSuccess,
    needSendAllFiles
} from '@components/Operations/components/FileUpload/FileUpload.utils'
import { actions } from '@cxbox-ui/core'
import { UPLOAD_FILE_STATUS, UPLOAD_TYPE } from '@components/Operations/components/FileUpload/FileUpload.constants'
import { UploadFileStatus } from 'antd/es/upload/interface'
import { useHover } from '@hooks/useHover'

export const useTimeoutIdList = () => {
    const list = useRef<NodeJS.Timeout[]>([])

    const clearList = useCallback(() => {
        list.current.forEach(timeoutId => clearTimeout(timeoutId))
        list.current = []
    }, [])

    const removeItem = useCallback((timeoutId?: NodeJS.Timeout) => {
        list.current.filter(id => id !== timeoutId)
    }, [])

    const addItem = useCallback((timeoutId?: NodeJS.Timeout) => {
        timeoutId && list.current.push(timeoutId)
    }, [])

    return useMemo(
        () => ({
            items: list,
            clear: clearList,
            remove: removeItem,
            add: addItem
        }),
        [addItem, clearList, removeItem]
    )
}

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

    const getAddedFileList = useCallback(() => {
        return addedFileList
    }, [addedFileList])

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
        clearAddedFiles,
        changeFileStatuses,
        removeAddedFiles
    }
}

export const useUploadFilesInfoWithAutoRemove = (accept?: string) => {
    const uploadFilesInfo = useUploadFilesInfo(accept)
    const { removeAddedFiles, getAddedFileList } = uploadFilesInfo
    const addedFileList = getAddedFileList()

    const [callbackRef, isHovering] = useHover<HTMLDivElement>()
    const timeoutIdList = useTimeoutIdList()

    useEffect(() => {
        timeoutIdList.clear()
        const uidListForDeletion = addedFileList.filter(file => isFileUploadSuccess(file.status)).map(file => file.uid)

        if (uidListForDeletion.length && !isHovering) {
            const timeoutId = setTimeout(() => {
                removeAddedFiles(uidListForDeletion)
                timeoutIdList.remove(timeoutId)
            }, 5000)

            timeoutIdList.add(timeoutId)
        }
    }, [addedFileList, isHovering, removeAddedFiles, timeoutIdList])

    // cancels deletion of uploaded files when hovering over a notification
    useEffect(() => {
        if (isHovering) {
            timeoutIdList.clear()
        }
    }, [isHovering, timeoutIdList])

    return {
        callbackRef,
        ...uploadFilesInfo
    }
}

export const useBulkUploadFiles = (bcName: string, accept?: string) => {
    const uploadFilesInfo = useUploadFilesInfoWithAutoRemove(accept)
    const { getAddedFileList } = uploadFilesInfo
    const addedFileList = getAddedFileList()

    const uploadedFileIds = useRef<Record<string, true>>({})

    const changeUploadedFileIds = useCallback((fileIds: string[]) => {
        fileIds.forEach(id => (uploadedFileIds.current[id] = true))
    }, [])

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (needSendAllFiles(addedFileList) && bcName) {
            const fileIdList = getDoneIdsFromFilesInfo(addedFileList).filter(id => !uploadedFileIds.current[id])
            changeUploadedFileIds(fileIdList)

            fileIdList.length &&
                dispatch(
                    actions.bulkUploadFiles({
                        isPopup: false,
                        bcName: bcName,
                        fileIds: fileIdList
                    })
                )
        }
    }, [dispatch, addedFileList, bcName, changeUploadedFileIds])

    useEffect(() => {
        if (addedFileList.length === 0) {
            uploadedFileIds.current = {}
        }
    }, [addedFileList.length])

    return uploadFilesInfo
}
