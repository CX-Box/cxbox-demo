import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { Icon, Upload } from 'antd'
import styles from './FileUpload.less'
import { useAppDispatch } from '@store'
import { getFileUploadEndpoint } from '@utils/api'
import { actions } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'
import { UploadFileStatus, UploadProps } from 'antd/es/upload/interface'
import { OperationInfo } from '@interfaces/widget'
import { WidgetMeta } from '@interfaces/core'
import cn from 'classnames'

interface FileInfo {
    id: null | string
    status: 'init' | UploadFileStatus
}

interface FileUploadProps {
    widget: WidgetMeta
    operationInfo?: OperationInfo
    mode?: 'default' | 'drag'
    children?: ReactNode
}

export const FileUpload = ({ mode, widget, operationInfo, children }: FileUploadProps) => {
    const { t } = useTranslation()
    const uploadUrl = getFileUploadEndpoint()
    const [fileInfoDictionary, setFileInfoDictionary] = useState<Record<string, FileInfo>>({})
    const fileInfoList = useMemo(() => Object.values(fileInfoDictionary), [fileInfoDictionary])

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (needDownloadAllFiles(fileInfoList) && widget.bcName) {
            dispatch(
                actions.bulkUploadFiles({
                    isPopup: false,
                    bcName: widget.bcName,
                    fileIds: getDoneIdsFromFilesInfo(fileInfoList)
                })
            )

            setFileInfoDictionary({})
        }
    }, [dispatch, fileInfoList, widget.bcName])

    const commonUploadProps: UploadProps = {
        action: uploadUrl,
        accept: operationInfo?.fileAccept,
        showUploadList: false,
        multiple: true,
        beforeUpload: file => {
            setFileInfoDictionary(filesInfo => ({ ...filesInfo, [file.uid]: { id: null, status: 'init' } }))

            return true
        },
        disabled: !!fileInfoList.length,
        onChange: info => {
            if (isFileDownloadComplete(info.file.status as string)) {
                setFileInfoDictionary(filesInfo => ({
                    ...filesInfo,
                    [info.file.uid]: {
                        id: info.file.response.data.id,
                        status: info.file.status as UploadFileStatus
                    }
                }))
            }
        }
    }

    const hintText = useFileUploadHint(operationInfo)

    if (mode === 'drag') {
        return (
            <Upload.Dragger {...commonUploadProps} className={styles.root}>
                <p className={styles.icon}>
                    <Icon type="inbox" />
                </p>
                <p className={styles.imitationButton}>{t('Click Here to Select Files')}</p>
                <p className={cn(styles.text, styles.bold, styles.mr4)}>{t('Or drag files to this area')}</p>
                <p className={styles.text}>{t('Add at least one file, support for a single or bulk upload')}</p>
                <p className={styles.hint}>{hintText}</p>
            </Upload.Dragger>
        )
    }

    return <Upload {...commonUploadProps}>{children}</Upload>
}

const isFileDownloadComplete = (fileStatus: string | UploadFileStatus) => {
    return (['error', 'done'] as UploadFileStatus[]).includes(fileStatus as UploadFileStatus)
}

const needDownloadAllFiles = (filesInfo: FileInfo[]) => {
    return filesInfo.length !== 0 && filesInfo.every(filesInfo => isFileDownloadComplete(filesInfo.status as UploadFileStatus))
}

const getDoneIdsFromFilesInfo = (filesInfo: FileInfo[]) => {
    return filesInfo.filter(fileInfo => fileInfo.status === 'done' && fileInfo.id).map(fileInfo => fileInfo.id as string)
}

const useFileUploadHint = (operationInfo?: OperationInfo) => {
    const { t } = useTranslation()

    const hintPermission = operationInfo?.fileAccept
        ?.split(',')
        ?.map(item => item.slice(1).toUpperCase())
        ?.join(', ')

    return hintPermission ? t('Supports only format', { permission: hintPermission }) : ''
}
