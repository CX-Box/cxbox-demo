import React from 'react'
import { Button, Icon, Progress, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import copyTextToClipboard from '@utils/copyTextToClipboard'
import {
    getProgressColorFromUploadStatus,
    isFileException,
    isFileUploading,
    isFileUploadSuccess
} from '@components/Operations/components/FileUpload/FileUpload.utils'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'
import { UPLOAD_FILE_STATUS } from '@components/Operations/components/FileUpload/FileUpload.constants'
import { tooltipErrorFileUploadTextMaxDisplayed } from '@components/Operations/components/FileUpload/UploadList.constants'
import styles from './UploadList.less'

export interface UploadListProps {
    fileList?: AddedFileInfo[]
    // the arrow of a line in progress
    direction?: 'upload' | 'download'
}

export function UploadList({ fileList, direction = 'upload' }: UploadListProps) {
    const { t } = useTranslation()

    return (
        <div className={styles.root} data-test-file-upload-prgress-list={true}>
            {fileList?.map(file => {
                const mainColor = getProgressColorFromUploadStatus(file.status)

                let fileIcon = <Icon type="file" />

                if (isFileUploading(file.status)) {
                    fileIcon = <Icon type="loading" />
                }

                let uploadTypeIcon = <Icon type={direction} style={{ color: mainColor }} />

                if (isFileUploadSuccess(file.status)) {
                    uploadTypeIcon = <Icon type="check-circle" theme="filled" style={{ color: mainColor }} />
                } else if (isFileException(file.status)) {
                    uploadTypeIcon = <Icon type="close-circle" style={{ color: mainColor }} />
                }

                const percent = isFileException(file.status) ? 100 : file.percent

                const isError = file.status === UPLOAD_FILE_STATUS.error
                const errorText = file.errorMessage ?? ''
                const errorTooLong = errorText.length > tooltipErrorFileUploadTextMaxDisplayed
                // error: show the detailed error if it fits, otherwise the standard message + a copy button; any other status shows its status message
                const displayedText = isError
                    ? errorTooLong
                        ? file.statusInformation
                        : errorText || file.statusInformation
                    : file.statusInformation
                const showCopyButton = isError && errorTooLong

                return 'percent' in file ? (
                    <div
                        key={file.uid}
                        className={styles.fileRow}
                        data-test-file-upload-prgress-item={true}
                        data-test-file-name={file.name}
                        data-test-file-status={file.status}
                        data-test-file-status-information={file.statusInformation}
                    >
                        {/* The delay lets the pointer reach the copy button without closing the tooltip. */}
                        <Tooltip
                            overlay={
                                displayedText ? (
                                    <div className={styles.statusInformation} data-test-file-status-tooltip={true}>
                                        {displayedText}
                                        {showCopyButton && (
                                            <div>
                                                <Button
                                                    className={styles.copyDetailsBtn}
                                                    type="link"
                                                    size="small"
                                                    icon="copy"
                                                    onClick={() =>
                                                        copyTextToClipboard(file.errorMessage ?? '', t('Text copied successfully'))
                                                    }
                                                >
                                                    {t('Copy details')}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : undefined
                            }
                            placement="leftBottom"
                            mouseLeaveDelay={0.3}
                        >
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
