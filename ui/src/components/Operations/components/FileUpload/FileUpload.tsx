import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { Icon, Upload } from 'antd'
import styles from './FileUpload.less'
import { useAppDispatch } from '@store'
import { getFileUploadEndpoint } from '@utils/api'
import { actions } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'
import { UploadFile, UploadFileStatus, UploadProps } from 'antd/es/upload/interface'
import { OperationInfo } from '@interfaces/widget'
import { WidgetMeta } from '@interfaces/core'
import cn from 'classnames'
import { useFileUploadHint } from '@components/Operations/components/FileUpload/FileUpload.hooks'
import {
    getDoneIdsFromFilesInfo,
    isFileDownloadComplete,
    needSendAllFiles
} from '@components/Operations/components/FileUpload/FileUpload.utils'
import { FileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'
import { UploadListContainer } from '@components/Operations/components/FileUpload/UploadListContainer'

interface FileUploadProps {
    widget: WidgetMeta
    operationInfo?: OperationInfo
    mode?: 'default' | 'drag'
    children?: ReactNode
}

export const FileUpload = ({ mode, widget, operationInfo, children }: FileUploadProps) => {
    const { t } = useTranslation()
    const uploadUrl = getFileUploadEndpoint()
    const [addedFileDictionary, setAddedFileDictionary] = useState<Record<string, FileInfo>>({})
    const addedFileList = useMemo(() => Object.values(addedFileDictionary), [addedFileDictionary])
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (needSendAllFiles(addedFileList) && widget.bcName) {
            dispatch(
                actions.bulkUploadFiles({
                    isPopup: false,
                    bcName: widget.bcName,
                    fileIds: getDoneIdsFromFilesInfo(addedFileList)
                })
            )

            setAddedFileDictionary({})
        }
    }, [dispatch, addedFileList, widget.bcName])

    const commonUploadProps: UploadProps = {
        fileList: fileList,
        action: uploadUrl,
        accept: operationInfo?.fileAccept,
        showUploadList: false,
        multiple: true,
        beforeUpload: file => {
            setAddedFileDictionary(filesInfo => ({ ...filesInfo, [file.uid]: { id: null, status: 'init' } }))

            return true
        },
        onChange: info => {
            setFileList(info.fileList)

            if (addedFileDictionary[info.file.uid].status === 'init' || (info.file.percent && Math.floor(info.file.percent) % 10 === 0)) {
                setAddedFileDictionary(filesInfo => ({
                    ...filesInfo,
                    [info.file.uid]: {
                        ...filesInfo[info.file.uid],
                        status: info.file.status as UploadFileStatus,
                        percent: info.file.percent
                    }
                }))
            }

            if (isFileDownloadComplete(info.file.status as string)) {
                setAddedFileDictionary(filesInfo => ({
                    ...filesInfo,
                    [info.file.uid]: {
                        id: info.file.response?.data?.id ?? null,
                        status: info.file.status as UploadFileStatus
                    }
                }))
            }
        }
    }

    const hintText = useFileUploadHint(operationInfo)

    return (
        <>
            {mode === 'drag' ? (
                <Upload.Dragger {...commonUploadProps} className={styles.root}>
                    <p className={styles.icon}>
                        <Icon type="inbox" />
                    </p>
                    <p className={styles.imitationButton}>{t('Click Here to Select Files')}</p>
                    <p className={cn(styles.text, styles.bold, styles.mr4)}>{t('Or drag files to this area')}</p>
                    <p className={styles.text}>{t('Add at least one file, support for a single or bulk upload')}</p>
                    <p className={styles.hint}>{hintText}</p>
                </Upload.Dragger>
            ) : (
                <Upload {...commonUploadProps}>{children}</Upload>
            )}
            <UploadListContainer widget={widget} fileList={fileList} addedFileList={addedFileList} changeFileList={setFileList} />
        </>
    )
}
