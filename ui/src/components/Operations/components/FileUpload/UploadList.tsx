import React from 'react'
import { UploadFile } from 'antd/es/upload/interface'
import { Icon, Progress } from 'antd'
import {
    convertUploadStatusToProgress,
    isFileDownloadComplete,
    isFileDownloadError
} from '@components/Operations/components/FileUpload/FileUpload.utils'
import styles from './UploadList.less'

interface UploadListProps {
    fileList?: UploadFile[]
}

export function UploadList({ fileList }: UploadListProps) {
    return (
        <div className={styles.root}>
            {fileList?.map(file => {
                return 'percent' in file ? (
                    <div key={file.uid}>
                        <div className={styles.fileName}>
                            {isFileDownloadComplete(file.status) ? <Icon type="file" /> : <Icon type="loading" />}
                            <span>{file.name}</span>
                        </div>
                        <Progress
                            type="line"
                            strokeWidth={2}
                            showInfo={false}
                            percent={isFileDownloadError(file.status) ? 100 : file.percent}
                            status={convertUploadStatusToProgress(file.status)}
                        />
                    </div>
                ) : null
            })}
        </div>
    )
}
