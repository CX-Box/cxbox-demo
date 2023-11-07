import React, { useCallback } from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { Icon, Upload } from 'antd'
import { UploadFile } from 'antd/es/upload/interface'
import { applyParams, getFileUploadEndpoint } from '@utils/api'
import styles from './FileUpload.less'
import { BaseFieldProps, ChangeDataItemPayload } from '@cxboxComponents/Field/Field'
import { actions, interfaces } from '@cxbox-ui/core'
import { useAppDispatch, useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'

interface Props extends Omit<BaseFieldProps, 'meta'> {
    value: string
    meta: interfaces.FileUploadFieldMeta
    placeholder?: string
}

const FileUpload: React.FunctionComponent<Props> = ({
    widgetName,
    cursor,
    disabled,
    readOnly,
    metaError,
    placeholder,
    meta,
    value: fieldValue
}) => {
    const dispatch = useAppDispatch()

    const { key: fieldName, fileIdKey, fileSource, snapshotKey, snapshotFileIdKey } = meta

    const widgetMeta = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName))
    const bcName = widgetMeta?.bcName
    const fieldDataItem = useAppSelector(state => (bcName && state.data[bcName]?.find(item => item.id === cursor)) || undefined)

    const pendingData = useAppSelector(state => (bcName && cursor && state.view.pendingDataChanges[bcName]?.[cursor]) || undefined)
    const fileIdDelta = (!readOnly ? pendingData?.[fileIdKey] : null) as string
    const fileNameDelta = !readOnly && (pendingData?.[fieldName] as string)

    const onStartUpload = useCallback(() => {
        dispatch(actions.uploadFile(null))
    }, [dispatch])

    const onDeleteFile = useCallback(
        (payload: ChangeDataItemPayload) => {
            dispatch(actions.changeDataItem({ ...payload, bcUrl: buildBcUrl(payload.bcName, true) }))
        },
        [dispatch]
    )

    const onUploadFileFailed = useCallback(() => {
        dispatch(actions.uploadFileFailed(null))
    }, [dispatch])

    const onUploadFileDone = useCallback(
        (payload: ChangeDataItemPayload) => {
            dispatch(actions.changeDataItem({ ...payload, bcUrl: buildBcUrl(payload.bcName, true) }))
            dispatch(actions.uploadFileDone(null))
        },
        [dispatch]
    )

    const onUploadSuccess = React.useCallback(
        (response: any, file: UploadFile) => {
            onUploadFileDone({
                bcName: bcName || '',
                cursor: cursor || '',
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
            bcName: bcName || '',
            cursor: cursor || '',
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
        id: fileIdDelta || ((fileIdKey && fieldDataItem?.[fileIdKey as keyof typeof fieldDataItem]?.toString()) as string)
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
                id: fieldDataItem?.[snapshotFileIdKey as keyof typeof fieldDataItem]?.toString() as string
            }
            const diffDownloadUrl = applyParams(getFileUploadEndpoint(), diffDownloadParams)
            const diffFileName = fieldDataItem?.[snapshotKey as keyof typeof fieldDataItem]

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
                <span className={styles.uploadLinkText} title={placeholder || t('select file')}>
                    {placeholder || t('select file')}
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

export default React.memo(FileUpload)
