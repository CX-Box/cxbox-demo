import React from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { Icon } from 'antd'
import { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { AxiosError } from 'axios'
import FileIcon from './FileIconContainer'
import { trimString } from '@utils/fileViewer'
import Upload from '@components/Upload'
import Button from '@components/ui/Button/Button'
import { useAppDispatch } from '@store'
import { actions } from '@actions'
import styles from './FileUpload.less'

export interface AdditionalUploadProps extends UploadProps {
    onStart: (file: UploadFile) => void
    onProgress: (event: ProgressEvent & { percent?: number }, file: UploadFile) => void
    onSuccess: (response: any, file: UploadFile) => void
    onError: (error: AxiosError, response: any, file: UploadFile) => void
}

interface SingleFileUploadProps extends AdditionalUploadProps {
    downloadUrl?: string // undefined if file url for download is not correct (no id)
    fileName: string
    placeholder?: string
    error?: boolean
    onDelete: () => void
    onFileIconClick?: () => void
}

const SingleFileUpload: React.FunctionComponent<SingleFileUploadProps> = ({
    downloadUrl,
    fileName,
    placeholder,
    error,
    onDelete,
    name = 'file',
    showUploadList = false,
    disabled,
    onFileIconClick,
    ...restProps
}) => {
    const uploadProps = {
        name,
        showUploadList,
        disabled,
        ...restProps
    }

    const dispatch = useAppDispatch()

    const { t } = useTranslation()

    const fileIcon = <FileIcon fileName={fileName} onFileIconClick={onFileIconClick} />

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

    const controls: { [key: string]: React.ReactNode } = {
        deleteButton: (
            <button className={styles.deleteButton} disabled={disabled} onClick={onDelete} key="delete-btn">
                <Icon type="delete" title={t('Delete')} />
            </button>
        ),

        uploadButton: (
            <Upload {...uploadProps} className={cn(styles.uploadButton, { [styles.error]: error })} key="upload-btn">
                <span title={t('select file')} className={styles.uploadButtonText}>
                    ...
                </span>
            </Upload>
        ),

        uploadLink: (
            <Upload {...uploadProps} className={cn(styles.uploadLink, { [styles.error]: error })} key="upload-lnk">
                <span className={styles.uploadLinkText} title={placeholder || t('select file')}>
                    {placeholder || t('select file')}
                </span>
            </Upload>
        ),

        downloadLink: (
            <div className={styles.downloadLink} title={`${t('Download')} ${fileName}`} key="download-lnk">
                <Button type="Link" onClick={handleDownload}>
                    <span className={styles.downloadLinkText}>{trimString(fileName)}</span>
                </Button>
                {fileIcon}
            </div>
        )
    }

    return (
        <div
            className={cn(styles.fileUpload, {
                [styles.disabled]: disabled,
                [styles.error]: error
            })}
        >
            {downloadUrl
                ? [controls.downloadLink, controls.uploadButton, controls.deleteButton]
                : [controls.uploadLink, controls.uploadButton]}
        </div>
    )
}

export default React.memo(SingleFileUpload)
