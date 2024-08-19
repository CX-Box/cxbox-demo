import React from 'react'
import cn from 'classnames'
import styles from './FileUpload.less'
import FileIcon from './FileIconContainer'
import { trimString } from '@utils/fileViewer'
import { CxBoxApiInstance } from '../../api'
import Button from '@components/ui/Button/Button'

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

    const handleDownload = () => {
        downloadUrl && CxBoxApiInstance.saveBlob(downloadUrl, fileName)
    }

    const handleDiffDownload = () => {
        diffDownloadUrl && CxBoxApiInstance.saveBlob(diffDownloadUrl, diffFileName)
    }

    if (mode === 'snapshot') {
        if ((diffDownloadUrl || downloadUrl) && diffDownloadUrl !== downloadUrl) {
            return (
                <div className={cn(styles.snapshot)}>
                    {smartIcon}
                    <div>
                        {diffDownloadUrl && (
                            <div>
                                <span className={cn(styles.viewLink, styles.prevValue)}>
                                    <Button type="link" removeIndentation={true} onClick={handleDiffDownload}>
                                        <span>{trimString(diffFileName)}</span>
                                    </Button>
                                </span>
                            </div>
                        )}
                        {downloadUrl && (
                            <div>
                                <span className={cn(styles.viewLink, styles.newValue)}>
                                    <Button type="link" removeIndentation={true} onClick={handleDownload}>
                                        <span>{trimString(fileName)}</span>
                                    </Button>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    }

    return (
        <div className={styles.root}>
            {smartIcon}
            <Button type="link" removeIndentation={true} onClick={handleDownload}>
                <span className={styles.viewLink}>{downloadUrl && <span>{trimString(fileName)}</span>}</span>
            </Button>
        </div>
    )
}

export default React.memo(ReadOnlySingleFileUpload)
