import React from 'react'
import { Icon, Progress, Tooltip } from 'antd'
import {
    getProgressColorFromUploadStatus,
    isFileException,
    isFileUploading,
    isFileUploadSuccess
} from '@components/Operations/components/FileUpload/FileUpload.utils'
import styles from './UploadList.module.less'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'

interface UploadListProps {
    fileList?: AddedFileInfo[]
}

export function UploadList({ fileList }: UploadListProps) {
    return (
        <div className={styles.root} data-test-file-upload-prgress-list={true}>
            {fileList?.map(file => {
                const mainColor = getProgressColorFromUploadStatus(file.status)

                let fileIcon = <Icon type="file" />

                if (isFileUploading(file.status)) {
                    fileIcon = <Icon type="loading" />
                }

                let uploadTypeIcon = <Icon type="upload" style={{ color: mainColor }} />

                if (isFileUploadSuccess(file.status)) {
                    uploadTypeIcon = <Icon type="check-circle" theme="filled" style={{ color: mainColor }} />
                } else if (isFileException(file.status)) {
                    uploadTypeIcon = <Icon type="close-circle" style={{ color: mainColor }} />
                }

                const percent = isFileException(file.status) ? 100 : file.percent

                return 'percent' in file ? (
                    <div
                        key={file.uid}
                        className={styles.fileRow}
                        data-test-file-upload-prgress-item={true}
                        data-test-file-name={file.name}
                        data-test-file-status={file.status}
                        data-test-file-status-information={file.statusInformation}
                    >
                        <Tooltip overlay={file.statusInformation} placement="leftBottom">
                            <div className={styles.fileName}>
                                {fileIcon}
                                <span>{file.name}</span>
                            </div>
                            <div className={styles.progressContainer}>
                                <Progress type="line" strokeWidth={2} showInfo={false} percent={percent} strokeColor={mainColor} />
                                {uploadTypeIcon}
                            </div>
                        </Tooltip>
                    </div>
                ) : null
            })}
        </div>
    )
}
