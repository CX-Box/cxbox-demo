import React from 'react'
import cn from 'classnames'
import styles from './FileUpload.less'
import FileIcon from './FileIconContainer'
import { trimString } from '@utils/fileViewer'
import { CxBoxApiInstance } from '../../api'
import Button from '@components/ui/Button/Button'
import FileViewer from '@components/FileViewer/FileViewer'
import { FilePreviewMode } from '@interfaces/widget'
import { PREVIEW_WIDTH_DEFAULT } from '@constants/fileViewer'

export interface ReadOnlySingleFileUploadProps {
    mode?: FilePreviewMode
    width?: number
    height?: number

    fileName: string
    downloadUrl?: string // undefined if file url for download is not correct (no id)

    diffFileName?: string
    diffDownloadUrl?: string // undefined if file url for download is not correct (no id)
    onFileIconClick?: () => void
}

function ReadOnlySingleFileUpload({
    mode = 'popup',
    width,
    height,
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

    if (mode === 'inline') {
        const normalizedWidth = width ?? PREVIEW_WIDTH_DEFAULT
        const normalizedHeight = height ?? normalizedWidth

        return (
            <FileViewer
                fileName={fileName}
                url={downloadUrl}
                view="preview"
                width={normalizedWidth}
                height={normalizedHeight}
                onClick={onFileIconClick}
            />
        )
    }

    if ((diffDownloadUrl || downloadUrl) && diffDownloadUrl !== downloadUrl) {
        return (
            <div className={cn(styles.snapshot)}>
                {smartIcon}
                <div onClickCapture={e => e.stopPropagation()}>
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

    return (
        <div className={styles.root}>
            {smartIcon}
            <Button className={styles.readOnlyFileButton} type="link" removeIndentation={true} onClick={handleDownload}>
                <span className={styles.viewLink}>{downloadUrl && <span>{trimString(fileName)}</span>}</span>
            </Button>
        </div>
    )
}

export default React.memo(ReadOnlySingleFileUpload)
