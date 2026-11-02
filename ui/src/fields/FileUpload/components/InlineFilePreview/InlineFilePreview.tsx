import React, { useCallback } from 'react'
import { UploadFile } from 'antd/es/upload/interface'
import axios, { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { DataValue } from '@cxbox-ui/core'
import FileViewer from '@components/FileViewer/FileViewer'
import FullscreenLayout from '@components/FileViewerContainer/components/FullscreenLayout'
import Header from '@components/FileViewerContainer/components/Header'
import Button from '@components/ui/Button/Button'
import Upload from '@components/Upload'
import { UploadListContainer } from '@components/Operations/components/FileUpload/UploadListContainer'
import { useUploadFilesInfoWithAutoRemove } from '@components/Operations/components/FileUpload/FileUpload.hooks'
import { checkFileFormat } from '@components/Operations/components/FileUpload/FileUpload.utils'
import { useSingleUploadRequest } from '@hooks/useSingleUploadRequest'
import { useFlatFormFields } from '@hooks/useFlatFormFields'
import { useFileFieldData } from '@hooks/useFileFieldData'
import { useVisibility } from '@hooks/useVisibility'
import { useWindowSize } from '@hooks/useWindowSize'
import { useAppDispatch, useAppSelector } from '@store'
import { applyParams, getFileUploadEndpoint } from '@utils/api'
import { buildBcUrl } from '@utils/buildBcUrl'
import { actions } from '@actions'
import { RowMetaField } from '@interfaces/rowMeta'
import { WidgetField } from '@cxbox-ui/schema'
import { FileUploadFieldMeta } from '@interfaces/widget'
import { selectBc, selectWidget } from '@selectors/selectors'
import styles from './InlineFilePreview.less'
import ImageControlButtons from '@components/FileViewer/components/ImageControlButtons/ImageControlButtons'

interface InlineFilePreviewProps {
    widgetName?: string
    fieldKey?: string
    disabled?: boolean
}

function InlineFilePreview({ widgetName, fieldKey = '', disabled = false }: InlineFilePreviewProps) {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const widget = useAppSelector(selectWidget(widgetName))
    const flatFields = useFlatFormFields(widget?.fields || []) as WidgetField[]
    const widgetField = flatFields.find(field => field.key === fieldKey) as FileUploadFieldMeta | undefined

    const { fileSource, fileIdKey = '' } = widgetField ?? {}

    // the inline preview is not a popup: it always shows the active record
    const recordId = useAppSelector(state => selectBc(state, widget?.bcName)?.cursor)
    const { fileName = '', downloadUrl } = useFileFieldData(widget?.bcName, recordId, fieldKey, fileIdKey, fileSource)

    const bcName = widget?.bcName as string
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl])
    const rowMetaField = rowMeta?.fields.find(field => field.key === fieldKey) as RowMetaField | undefined
    const fileAccept = rowMetaField?.fileAccept

    const { visibility: fullscreen, changeVisibility: setFullscreen } = useVisibility(false)
    const { width, height } = useWindowSize()
    const handleCloseFullscreen = useCallback(() => setFullscreen(false), [setFullscreen])
    const handleDownload = useCallback(() => {
        if (downloadUrl) {
            dispatch(actions.downloadFileByUrl({ url: downloadUrl, name: fileName }))
        }
    }, [dispatch, downloadUrl, fileName])

    const { getAddedFileList, clearAddedFiles, initializeNewAddedFile, initializeNotSupportedFile, updateAddedFile, callbackRef } =
        useUploadFilesInfoWithAutoRemove(fileAccept)

    const customRequest = useSingleUploadRequest()

    const changeDataItem = useCallback(
        (fileId: DataValue, fileName: DataValue) => {
            dispatch(
                actions.changeDataItem({
                    bcName: bcName || '',
                    cursor: recordId || '',
                    bcUrl,
                    dataItem: {
                        [fileIdKey]: fileId,
                        [fieldKey]: fileName
                    }
                })
            )
        },
        [bcName, bcUrl, recordId, dispatch, fileIdKey, fieldKey]
    )

    const onFileDelete = useCallback(() => {
        changeDataItem(null, null)
        clearAddedFiles()
    }, [changeDataItem, clearAddedFiles])

    const beforeUpload = useCallback(
        (file: UploadFile) => {
            if (checkFileFormat(file.name, fileAccept)) {
                clearAddedFiles(['done'])
                initializeNewAddedFile(file.uid, file.name, 'edit')
                return true
            }
            initializeNotSupportedFile(file.name, 'edit')
            return false
        },
        [clearAddedFiles, fileAccept, initializeNewAddedFile, initializeNotSupportedFile]
    )

    const onStartUpload = useCallback(
        (file: UploadFile) => {
            dispatch(actions.uploadFile(null))
            updateAddedFile(file.uid, { status: 'uploading', percent: 0 })
        },
        [dispatch, updateAddedFile]
    )

    const onProgressUpload = useCallback(
        (event: ProgressEvent & { percent?: number }, file: UploadFile) => {
            const percent = event.percent
            const needUpdatePercents = !!percent && Math.floor(percent) % 10 === 0

            if (needUpdatePercents) {
                updateAddedFile(file.uid, { name: file.name, status: 'uploading', percent })
            }
        },
        [updateAddedFile]
    )

    const onUploadSuccess = useCallback(
        (response: any, file: UploadFile) => {
            changeDataItem(response.data.id, response.data.name)
            dispatch(actions.uploadFileDone(null))
            updateAddedFile(file.uid, { id: response.data.id, status: 'done', percent: 100 })
        },
        [changeDataItem, dispatch, updateAddedFile]
    )

    const onUploadFailed = useCallback(
        (error: AxiosError<unknown>, response: any, file: UploadFile) => {
            dispatch(actions.uploadFileFailed(null))

            if (axios.isCancel(error)) {
                updateAddedFile(file.uid, { status: 'canceled', percent: 100, id: null })
            } else {
                updateAddedFile(file.uid, { status: 'error', percent: 100, id: null })
            }
        },
        [dispatch, updateAddedFile]
    )

    const uploadUrl = applyParams(getFileUploadEndpoint(), { source: fileSource })

    const renderImageFooter = useCallback(
        ({ displayType, imageControl }) => {
            return displayType === 'image' ? (
                <ImageControlButtons fullScreen={fullscreen} imageControl={imageControl} onChangeFullScreen={setFullscreen} />
            ) : null
        },
        [fullscreen, setFullscreen]
    )

    if (!fieldKey) {
        return null
    }

    const uploadProps = {
        name: 'file',
        accept: fileAccept,
        showUploadList: false,
        action: uploadUrl,
        customRequest: customRequest,
        beforeUpload: beforeUpload,
        onStart: onStartUpload,
        onProgress: onProgressUpload,
        onError: onUploadFailed,
        onSuccess: onUploadSuccess
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <FileViewer
                    fileName={fileName}
                    url={downloadUrl}
                    view="compact"
                    width={'100%'}
                    height={'100%'}
                    imageControlEnabled={true}
                    footer={renderImageFooter}
                />
            </div>
            <div className={styles.topActions}>
                {downloadUrl && (
                    <span className={styles.fileName} onClick={handleDownload} title={fileName}>
                        {fileName}
                    </span>
                )}
                <div className={styles.actionsGroup}>
                    {!disabled && (
                        <Upload {...uploadProps}>
                            <Button type="default" removeIndentation>
                                <span title={t('Upload')} className={styles.uploadDots}>
                                    ...
                                </span>
                            </Button>
                        </Upload>
                    )}
                    {downloadUrl && !disabled && (
                        <Button
                            icon="delete"
                            title={t('Delete')}
                            onClick={e => {
                                e.stopPropagation()
                                onFileDelete()
                            }}
                            type="default"
                            removeIndentation
                        />
                    )}
                </div>
            </div>
            <UploadListContainer
                ref={callbackRef}
                addedFileList={getAddedFileList()}
                onClose={clearAddedFiles}
                successHint={t('The file has been uploaded. Please save the changes')}
                data-test-notification-inner-container={true}
                data-test-notification-for-field={true}
                data-test-field-key={fieldKey}
                data-test-widget-name={widgetName}
            />
            <FullscreenLayout
                visible={fullscreen}
                title={
                    <Header
                        className={styles.fullscreenHeader}
                        theme="dark"
                        title={fileName}
                        onDownload={handleDownload}
                        onClose={handleCloseFullscreen}
                    />
                }
                content={
                    <FileViewer
                        fileName={fileName}
                        url={downloadUrl}
                        view="full"
                        width={width ?? 0}
                        height={height ? height - 80 : 0}
                        imageControlEnabled={true}
                        footer={renderImageFooter}
                    />
                }
            />
        </div>
    )
}

export default React.memo(InlineFilePreview)
