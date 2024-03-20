import React from 'react'
import { Icon, Progress, Tooltip } from 'antd'
import {
    getProgressColorFromUploadStatus,
    getProgressIcon,
    isFileDownloadComplete,
    isFileException
} from '@components/Operations/components/FileUpload/FileUpload.utils'
import styles from './UploadList.less'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'

interface UploadListProps {
    fileList?: AddedFileInfo[]
}

export function UploadList({ fileList }: UploadListProps) {
    return (
        <div className={styles.root}>
            {fileList?.map(file => {
                const mainColor = getProgressColorFromUploadStatus(file.status)
                const fileIcon =
                    !isFileDownloadComplete(file.status) && !isFileException(file.status) ? <Icon type="loading" /> : <Icon type="file" />
                const uploadTypeIcon = !!file.uploadType && (
                    <Icon type={getProgressIcon(file.uploadType)} theme="filled" style={{ color: mainColor }} />
                )

                return 'percent' in file ? (
                    <div key={file.uid} className={styles.fileRow}>
                        <Tooltip overlay={file.statusInformation} placement="leftBottom">
                            <div className={styles.fileName}>
                                {fileIcon}
                                <span>{file.name}</span>
                            </div>
                            <div className={styles.progressContainer}>
                                <Progress
                                    type="line"
                                    strokeWidth={2}
                                    showInfo={false}
                                    percent={isFileException(file.status) ? 100 : file.percent}
                                    strokeColor={mainColor}
                                />
                                {uploadTypeIcon}
                            </div>
                        </Tooltip>
                    </div>
                ) : null
            })}
        </div>
    )
}
