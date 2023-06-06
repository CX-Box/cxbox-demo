import React from 'react'
import { connect } from 'react-redux'
import { Store } from '@interfaces/store'
import { Dispatch } from 'redux'
import styles from './FileUpload.less'
import { Icon, Upload } from 'antd'
import { UploadFile } from 'antd/es/upload/interface'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { ChangeDataItemPayload } from '@teslerComponents/Field/Field'
import { DataItem } from '@tesler-ui/core'
import { applyParams, getFileUploadEndpoint } from '@tesler-ui/core'
import { $do } from '@actions/types'

export interface FileUploadOwnProps {
    fieldName: string
    bcName: string
    cursor: string
    fieldDataItem: DataItem
    fieldValue: string
    fileIdKey: string
    fileSource: string
    readOnly?: boolean
    disabled?: boolean
    metaError?: string
    snapshotKey?: string
    snapshotFileIdKey?: string
}

export interface FileUploadProps {
    fileIdDelta: string
    fileNameDelta: string
}

export interface FileUploadActions {
    onDeleteFile: (payload: ChangeDataItemPayload) => void
    onStartUpload: () => void
    onUploadFileDone: (payload: ChangeDataItemPayload) => void
    onUploadFileFailed: () => void
}

/**
 *
 * @param props
 * @category Components
 */
const FileUpload: React.FunctionComponent<FileUploadOwnProps & FileUploadProps & FileUploadActions> = ({
    fieldName,
    bcName,
    cursor,
    fieldDataItem,
    fileIdKey,
    fileSource,
    fileIdDelta,
    fileNameDelta,
    disabled,
    readOnly,
    fieldValue,
    metaError,
    snapshotKey,
    snapshotFileIdKey,
    onStartUpload,
    onUploadFileDone,
    onUploadFileFailed,
    onDeleteFile
}) => {
    const onUploadSuccess = React.useCallback(
        (response: any, file: UploadFile) => {
            onUploadFileDone({
                bcName,
                cursor,
                dataItem: {
                    [fileIdKey]: response.data.id,
                    [fieldName]: response.data.name
                }
            })
        },
        [onUploadFileDone, bcName, cursor, fileIdKey, fieldName]
    )

    const onFileDelete = React.useCallback(() => {
        onDeleteFile({
            bcName,
            cursor,
            dataItem: {
                [fileIdKey]: null,
                [fieldName]: null
            }
        })
    }, [onDeleteFile, bcName, cursor, fileIdKey, fieldName])

    const onUploadFailed = React.useCallback(
        (error: any, response: any, file: UploadFile) => {
            onUploadFileFailed()
        },
        [onUploadFileFailed]
    )

    const { t } = useTranslation()

    const downloadParams = {
        source: fileSource,
        id: fileIdDelta || (fileIdKey && fieldDataItem?.[fileIdKey]?.toString())
    }
    const uploadParams = {
        source: fileSource
    }
    const downloadUrl = applyParams(getFileUploadEndpoint(), downloadParams)
    const uploadUrl = applyParams(getFileUploadEndpoint(), uploadParams)

    const uploadProps = {
        disabled,
        name: 'file',
        action: uploadUrl,
        onStart: onStartUpload,
        onError: onUploadFailed,
        onSuccess: onUploadSuccess
    }
    const fileName = fileNameDelta || fieldValue

    if (readOnly) {
        if (snapshotKey && snapshotFileIdKey) {
            const diffDownloadParams = {
                source: fileSource,
                id: fieldDataItem?.[snapshotFileIdKey]?.toString()
            }
            const diffDownloadUrl = applyParams(getFileUploadEndpoint(), diffDownloadParams)
            const diffFileName = fieldDataItem?.[snapshotKey]

            if ((diffDownloadParams.id || downloadParams.id) && diffDownloadParams.id !== downloadParams.id) {
                return (
                    <div>
                        {diffDownloadParams.id && (
                            <div>
                                <span className={cn(styles.viewLink, styles.prevValue)}>
                                    <a href={diffDownloadUrl}>
                                        <Icon type="file" /> <span>{diffFileName}</span>
                                    </a>
                                </span>
                            </div>
                        )}
                        {downloadParams.id && (
                            <div>
                                <span className={cn(styles.viewLink, styles.newValue)}>
                                    <a href={downloadUrl}>
                                        <Icon type="file" /> <span>{fileName}</span>
                                    </a>
                                </span>
                            </div>
                        )}
                    </div>
                )
            }
        }

        return (
            <span className={styles.viewLink}>
                {downloadParams.id && (
                    <a href={downloadUrl}>
                        <Icon type="file" /> <span>{fileName}</span>
                    </a>
                )}
            </span>
        )
    }

    const controls: { [key: string]: React.ReactNode } = {
        deleteButton: (
            <div className={styles.deleteButton} onClick={onFileDelete} key="delete-btn">
                <Icon type="delete" title={t('Delete')} />
            </div>
        ),

        uploadButton: (
            <Upload {...uploadProps} className={cn(styles.uploadButton, { [styles.error]: metaError })} key="upload-btn">
                <span title={t('select file')} className={styles.uploadButtonText}>
                    ...
                </span>
            </Upload>
        ),

        uploadLink: (
            <Upload {...uploadProps} className={cn(styles.uploadLink, { [styles.error]: metaError })} key="upload-lnk">
                <span className={styles.uploadLinkText} title={t('select file')}>
                    {t('select file')}
                </span>
            </Upload>
        ),

        downloadLink: (
            <div className={styles.downloadLink} title={`${t('Download')} ${fileName}`} key="download-lnk">
                <a href={downloadUrl}>
                    <span className={styles.downloadLinkText}>{fileName}</span>
                </a>
            </div>
        )
    }

    return (
        <div
            className={cn(styles.fileUpload, {
                [styles.disabled]: disabled,
                [styles.error]: metaError
            })}
        >
            {disabled ? (
                <span className={styles.disabled}>{controls.downloadLink}</span>
            ) : downloadParams.id ? (
                [controls.downloadLink, controls.uploadButton, controls.deleteButton]
            ) : (
                [controls.uploadLink, controls.uploadButton]
            )}
        </div>
    )
}

function mapStateToProps(state: Store, props: FileUploadOwnProps) {
    const pendingData = state.view.pendingDataChanges[props.bcName]?.[props.cursor]
    return {
        fileIdDelta: !props.readOnly ? pendingData?.[props.fileIdKey] : null,
        fileNameDelta: !props.readOnly && pendingData?.[props.fieldName]
    }
}

function mapDispatchToProps(dispatch: Dispatch): FileUploadActions {
    return {
        onStartUpload: () => {
            dispatch($do.uploadFile(null))
        },
        onDeleteFile: (payload: ChangeDataItemPayload) => {
            dispatch($do.changeDataItem(payload))
        },
        onUploadFileFailed: () => {
            dispatch($do.uploadFileFailed(null))
        },
        onUploadFileDone: (payload: ChangeDataItemPayload) => {
            dispatch($do.changeDataItem(payload))
            dispatch($do.uploadFileDone(null))
        }
    }
}

/**
 * @category Components
 */
export default connect(mapStateToProps, mapDispatchToProps)(FileUpload)
