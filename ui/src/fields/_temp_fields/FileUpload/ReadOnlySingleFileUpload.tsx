import React from 'react'
import cn from 'classnames'
import FileIcon from './FileIconContainer'
import { trimString } from '@utils/fileViewer'
import Button from '@components/ui/Button/Button'
import { actions } from '@actions'
import { useAppDispatch } from '@store'
import styles from './FileUpload.less'

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
    const dispatch = useAppDispatch()

    const smartIcon = <FileIcon fileName={fileName} onFileIconClick={onFileIconClick} />

    const handleDownload = () => {
        if (downloadUrl) {
            dispatch(
                actions.downloadFileByUrl({
                    url: downloadUrl,
                    name: fileName
                })
            )
        }
    }

    const handleDiffDownload = () => {
        if (diffDownloadUrl) {
            dispatch(
                actions.downloadFileByUrl({
                    url: diffDownloadUrl,
                    name: diffFileName
                })
            )
        }
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
            <Button className={styles.readOnlyFileButton} type="link" removeIndentation={true} onClick={handleDownload}>
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
