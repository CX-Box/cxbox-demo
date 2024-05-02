import React from 'react'
import cn from 'classnames'
import styles from './FileUpload.less'
import FileIcon from './FileIconContainer'
import { trimString } from '@utils/fileViewer'

export interface ReadOnlySingleFileUploadProps {
    mode?: 'default' | 'snapshot'

    fileName: string
    downloadUrl?: string // undefined if file url for download is not correct (no id)

    diffFileName?: string
    diffDownloadUrl?: string // undefined if file url for download is not correct (no id)
    onFileIconClick?: () => void
}

function ReadOnlySingleFileUpload({
    mode,
    fileName,
    downloadUrl,
    diffFileName,
    diffDownloadUrl,
    onFileIconClick
}: ReadOnlySingleFileUploadProps) {
    const smartIcon = <FileIcon fileName={fileName} onFileIconClick={onFileIconClick} />

    if (mode === 'snapshot') {
        if ((diffDownloadUrl || downloadUrl) && diffDownloadUrl !== downloadUrl) {
            return (
                <div className={cn(styles.snapshot)}>
                    {smartIcon}
                    <div>
                        {diffDownloadUrl && (
                            <div>
                                <span className={cn(styles.viewLink, styles.prevValue)}>
                                    <a href={diffDownloadUrl}>
                                        <span>{trimString(diffFileName)}</span>
                                    </a>
                                </span>
                            </div>
                        )}
                        {downloadUrl && (
                            <div>
                                <span className={cn(styles.viewLink, styles.newValue)}>
                                    <a href={downloadUrl}>
                                        <span>{trimString(fileName)}</span>
                                    </a>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    }

    return (
        <span>
            {smartIcon}
            <span className={styles.viewLink}>
                {downloadUrl && (
                    <a href={downloadUrl} download={true}>
                        <span>{trimString(fileName)}</span>
                    </a>
                )}
            </span>
        </span>
    )
}

export default React.memo(ReadOnlySingleFileUpload)
