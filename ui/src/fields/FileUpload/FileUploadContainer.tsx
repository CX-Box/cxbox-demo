import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { UploadFile } from 'antd/es/upload/interface'
import { applyParams, getFileUploadEndpoint } from '@utils/api'
import { BaseFieldProps } from '@cxboxComponents/Field/Field'
import { useAppDispatch, useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useUploadFilesInfoWithAutoRemove } from '@components/Operations/components/FileUpload/FileUpload.hooks'
import { checkFileFormat } from '@components/Operations/components/FileUpload/FileUpload.utils'
import { UploadListContainer } from '@components/Operations/components/FileUpload/UploadListContainer'
import { RowMetaField } from '@interfaces/rowMeta'
import { useSingleUploadRequest } from '@hooks/useSingleUploadRequest'
import { AxiosError, CanceledError } from 'axios'
import SingleFileUpload from './SingleFileUpload'
import ReadOnlySingleFileUpload, { ReadOnlySingleFileUploadProps } from './ReadOnlySingleFileUpload'
import { DataValue } from '@interfaces/core'
import { actions } from '@actions'
import { FileUploadFieldMeta } from '@interfaces/widget'

interface Props extends Omit<BaseFieldProps, 'meta'> {
    value: string
    meta: FileUploadFieldMeta
    placeholder?: string
}

const FileUploadContainer: React.FunctionComponent<Props> = ({
    widgetName,
    cursor,
    disabled,
    readOnly,
    metaError,
    placeholder,
    meta,
    value: fieldValue
}) => {
    const { t } = useTranslation()
    const { key: fieldName, fileIdKey, fileSource, snapshotKey, snapshotFileIdKey, preview } = meta
    const widgetMeta = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName))
    const bcName = widgetMeta?.bcName as string
    const fieldDataItem = useAppSelector(state => (bcName && state.data[bcName]?.find(item => item.id === cursor)) || undefined)
    const pendingData = useAppSelector(state => (bcName && cursor && state.view.pendingDataChanges[bcName]?.[cursor]) || undefined)
    const fileIdDelta = (!readOnly ? pendingData?.[fileIdKey] : null) as string
    const fileNameDelta = !readOnly && (pendingData?.[fieldName] as string)
    const uploadType = 'edit'
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl])
    const rowMetaField = rowMeta?.fields.find(field => field.key === meta.key) as RowMetaField | undefined
    const fileAccept = rowMetaField?.fileAccept
    const { getAddedFileListWithout, clearAddedFiles, initializeNewAddedFile, initializeNotSupportedFile, updateAddedFile, callbackRef } =
        useUploadFilesInfoWithAutoRemove(fileAccept)

    const dispatch = useAppDispatch()

    const changeDataItem = useCallback(
        (fileId: DataValue, fileName: DataValue) => {
            dispatch(
                actions.changeDataItem({
                    bcName: bcName || '',
                    cursor: cursor || '',
                    bcUrl: buildBcUrl(bcName, true),
                    dataItem: {
                        [fileIdKey]: fileId,
                        [fieldName]: fileName
                    }
                })
            )
        },
        [bcName, cursor, dispatch, fieldName, fileIdKey]
    )

    const beforeUpload = useCallback(
        file => {
            if (checkFileFormat(file.name, fileAccept)) {
                clearAddedFiles(['done'])

                initializeNewAddedFile(file.uid, file.name, uploadType)

                return true
            }

            initializeNotSupportedFile(file.name, uploadType)

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

    const onUploadSuccess = React.useCallback(
        (response: any, file: UploadFile) => {
            changeDataItem(response.data.id, response.data.name)

            dispatch(actions.uploadFileDone(null))

            updateAddedFile(file.uid, { id: response.data.id, status: 'done', percent: 100 })
        },
        [changeDataItem, dispatch, updateAddedFile]
    )

    const onUploadFailed = React.useCallback(
        (error: AxiosError<unknown>, response: any, file: UploadFile) => {
            dispatch(actions.uploadFileFailed(null))

            if ((error as CanceledError<unknown>).code === AxiosError.ERR_CANCELED) {
                updateAddedFile(file.uid, { status: 'canceled', percent: 100, id: null })
            } else {
                updateAddedFile(file.uid, { status: 'error', percent: 100, id: null })
            }
        },
        [dispatch, updateAddedFile]
    )

    const onFileDelete = React.useCallback(() => {
        changeDataItem(null, null)

        clearAddedFiles()
    }, [changeDataItem, clearAddedFiles])

    const getDownloadUrl = (params: { id: string; source: string }) => {
        return params.id ? applyParams(getFileUploadEndpoint(), params) : undefined
    }

    const getReadOnlyDiffProps = () => {
        const isSnapshotMode = snapshotKey && snapshotFileIdKey

        if (isSnapshotMode) {
            const diffDownloadUrl = getDownloadUrl({
                source: fileSource,
                id: fieldDataItem?.[snapshotFileIdKey as keyof typeof fieldDataItem]?.toString() as string
            })
            const diffFileName = fieldDataItem?.[snapshotKey as keyof typeof fieldDataItem] as string

            return { mode: 'snapshot' as ReadOnlySingleFileUploadProps['mode'], diffFileName, diffDownloadUrl }
        }

        return
    }

    const downloadUrl = getDownloadUrl({
        source: fileSource,
        id: fileIdDelta || ((fileIdKey && fieldDataItem?.[fileIdKey as keyof typeof fieldDataItem]?.toString()) as string)
    })
    const uploadUrl = applyParams(getFileUploadEndpoint(), { source: fileSource })
    const customRequest = useSingleUploadRequest()
    const fileName = fileNameDelta || fieldValue

    const displayFileViewer = preview?.enabled
    const recordId = fieldDataItem?.id as string
    const handleFileIconClick = useCallback(() => {
        dispatch(actions.bcSelectRecord({ bcName, cursor: recordId }))

        dispatch(
            actions.showFileViewerPopup({
                active: true,
                options: {
                    type: 'file-viewer',
                    calleeFieldKey: fieldName
                },
                calleeWidgetName: widgetMeta?.name as string
            })
        )
    }, [bcName, dispatch, fieldName, recordId, widgetMeta?.name])

    if (readOnly) {
        const diffProps = getReadOnlyDiffProps()

        return (
            <ReadOnlySingleFileUpload
                fileName={fileName}
                downloadUrl={downloadUrl}
                {...diffProps}
                onFileIconClick={displayFileViewer ? handleFileIconClick : undefined}
            />
        )
    }

    return (
        <>
            <SingleFileUpload
                downloadUrl={downloadUrl}
                fileName={fileName}
                placeholder={placeholder}
                error={!!metaError}
                onDelete={onFileDelete}
                action={uploadUrl}
                accept={fileAccept}
                disabled={disabled}
                beforeUpload={beforeUpload}
                customRequest={customRequest}
                onProgress={onProgressUpload}
                onStart={onStartUpload}
                onError={onUploadFailed}
                onSuccess={onUploadSuccess}
                onFileIconClick={displayFileViewer ? handleFileIconClick : undefined}
            />
            <UploadListContainer
                ref={callbackRef}
                addedFileList={getAddedFileListWithout()}
                onClose={clearAddedFiles}
                successHint={t('The file has been uploaded. Please save the changes')}
                data-test-notification-inner-container={true}
                data-test-notification-for-field={true}
                data-test-field-key={meta.key}
                data-test-widget-name={widgetName}
            />
        </>
    )
}

export default React.memo(FileUploadContainer)
