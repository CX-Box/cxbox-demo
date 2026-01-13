import React from 'react'
import cn from 'classnames'
import styles from '../FileUpload.less'
import FilePreviewIcon from '../components/FilePreviewIcon'
import { trimString } from '@utils/fileViewer'
import Button from '@components/ui/Button/Button'

export interface ReadOnlySingleFileUploadProps {
    mode?: 'default' | 'snapshot'

    fileName: string
    downloadUrl?: string // undefined if file url for download is not correct (no id)

    diffFileName?: string
    diffDownloadUrl?: string // undefined if file url for download is not correct (no id)
    onFileIconClick?: () => void
    onDownload: () => void
    onDiffDownload?: () => void
}

function ReadOnlySingleFileUpload({
    mode,
    fileName,
    downloadUrl,
    diffFileName,
    diffDownloadUrl,
    onFileIconClick,
    onDownload,
    onDiffDownload
}: ReadOnlySingleFileUploadProps) {
    const smartIcon = <FilePreviewIcon fileName={fileName} onFileIconClick={onFileIconClick} />

    if (mode === 'snapshot') {
        if ((diffDownloadUrl || downloadUrl) && diffDownloadUrl !== downloadUrl) {
            return (
                <div className={cn(styles.snapshot)}>
                    {smartIcon}
                    <div>
                        {diffDownloadUrl && (
                            <div>
                                <span className={cn(styles.viewLink, styles.prevValue)}>
                                    <Button type="link" removeIndentation={true} onClick={onDiffDownload}>
                                        <span>{trimString(diffFileName)}</span>
                                    </Button>
                                </span>
                            </div>
                        )}
                        {downloadUrl && (
                            <div>
                                <span className={cn(styles.viewLink, styles.newValue)}>
                                    <Button type="link" removeIndentation={true} onClick={onDownload}>
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
            <Button className={styles.readOnlyFileButton} type="link" removeIndentation={true} onClick={onDownload}>
                {downloadUrl ? (
                    <>
                        {smartIcon}
                        {trimString(fileName)}
                    </>
                ) : null}
            </Button>
        </div>
    )
}

export default React.memo(ReadOnlySingleFileUpload)
