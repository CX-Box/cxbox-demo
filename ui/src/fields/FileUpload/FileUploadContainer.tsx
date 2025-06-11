import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UploadFile } from 'antd/es/upload/interface'
import { applyParams, getFileUploadEndpoint } from '@utils/api'
import { BaseFieldProps } from '@components/Field/Field'
import { useAppDispatch, useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useUploadFilesInfoWithAutoRemove } from '@components/Operations/components/FileUpload/FileUpload.hooks'
import { checkFileFormat } from '@components/Operations/components/FileUpload/FileUpload.utils'
import { UploadListContainer } from '@components/Operations/components/FileUpload/UploadListContainer'
import { RowMetaField } from '@interfaces/rowMeta'
import { useSingleUploadRequest } from '@hooks/useSingleUploadRequest'
import { AxiosError, CanceledError } from 'axios'
import SingleFileUpload from './SingleFileUpload'
import ReadOnlySingleFileUpload from './ReadOnlySingleFileUpload'
import { actions } from '@actions'
import { FileUploadFieldMeta } from '@interfaces/widget'
import { useDispatch } from 'react-redux'
import { usePrevious } from '@hooks/usePrevious'
import { DataValue } from '@cxbox-ui/core'
import { useInternalWidgetSelector } from '@hooks/useInternalWidgetSelector'
import { FileViewerMode } from '@interfaces/view'
import ImageControlButtons from '@components/FileViewer/ImageControlButtons/ImageControlButtons'
import ResizeObserver, { SizeInfo } from 'rc-resize-observer'
import debounce from 'lodash.debounce'
import ArrowPagination from '@components/ui/ArrowPagination/ArrowPagination'
import { useArrowPagination } from '@components/ui/ArrowPagination/ArrowPagination.hooks'
import { selectBcData, selectWidget } from '@selectors/selectors'
import { PreviewPaginationEnabledContext } from '@fields/FileUpload/context'
import { TEMP_DEFAULT_ROW_SIZE } from '@constants/fileViewer'

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
    meta: fieldMeta,
    value: fieldValue
}) => {
    const { t } = useTranslation()
    const { key: fieldName, fileIdKey, fileSource, snapshotKey, snapshotFileIdKey, preview } = fieldMeta
    const widgetMeta = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName))
    const bcName = widgetMeta?.bcName as string
    const fieldDataItem = useAppSelector(state => (bcName && state.data[bcName]?.find(item => item.id === cursor)) || undefined)
    const pendingData = useAppSelector(state => (bcName && cursor && state.view.pendingDataChanges[bcName]?.[cursor]) || undefined)
    const fileIdDelta = (!readOnly ? pendingData?.[fileIdKey] : null) as string
    const fileNameDelta = !readOnly && (pendingData?.[fieldName] as string)
    const uploadType = 'edit'
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl])
    const rowMetaField = rowMeta?.fields.find(field => field.key === fieldMeta.key) as RowMetaField | undefined
    const fileAccept = rowMetaField?.fileAccept
    const { getAddedFileList, clearAddedFiles, initializeNewAddedFile, initializeNotSupportedFile, updateAddedFile, callbackRef } =
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

            return { diffFileName, diffDownloadUrl }
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
    const handleFileIconClick = useFileIconClick(
        widgetMeta?.name as string,
        widgetMeta?.bcName as string,
        fieldDataItem?.id as string,
        fieldName
    )

    const [fileSize, setFileSize] = useState<{ defaultWidth: number | undefined; defaultHeight: number | undefined }>()

    const handlePreviewImageResize = useMemo(
        () =>
            debounce((size: SizeInfo) => {
                setFileSize({ defaultWidth: size.width, defaultHeight: size.width })
            }, 200),
        []
    )

    useEffect(() => {
        return () => {
            handlePreviewImageResize.cancel()
        }
    }, [handlePreviewImageResize])

    const widget = useAppSelector(state => selectWidget(state, widgetName))
    const paginationProps = useArrowPagination(widget)
    const data = useAppSelector(state => selectBcData(state, bcName))
    const totalCount = data?.length ?? 0
    const arrowPaginationEnabled = useContext(PreviewPaginationEnabledContext)

    const handleChangePagination = useCallback(
        (currentIndex: number) => {
            let newIndex = currentIndex

            if (newIndex >= totalCount) {
                newIndex = 0
            } else if (newIndex < 0) {
                newIndex = totalCount - 1
            }

            paginationProps.onChange(newIndex)
        },
        [paginationProps, totalCount]
    )

    if (readOnly) {
        const diffProps = getReadOnlyDiffProps()
        const width = fieldMeta.width ?? fileSize?.defaultWidth
        const height = fieldMeta.minRows ? fieldMeta.minRows * TEMP_DEFAULT_ROW_SIZE : fileSize?.defaultHeight

        return (
            <ResizeObserver onResize={handlePreviewImageResize}>
                <ArrowPagination
                    mode="image"
                    {...paginationProps}
                    onChange={handleChangePagination}
                    disabledLeft={!totalCount}
                    disabledRight={!totalCount}
                    hide={paginationProps.hide || !arrowPaginationEnabled}
                    styleWrapper={fieldMeta.width ? { width: '100%', maxWidth: 'min-content' } : undefined}
                >
                    <ReadOnlySingleFileUpload
                        fileName={fileName}
                        downloadUrl={downloadUrl}
                        {...diffProps}
                        width={width}
                        height={height}
                        mode={preview?.mode}
                        onFileIconClick={displayFileViewer ? handleFileIconClick : undefined}
                        footer={({ displayType, imageControl }) =>
                            displayType === 'image' && imageControl ? (
                                <ImageControlButtons
                                    imageControl={imageControl}
                                    fullScreen={false}
                                    onChangeFullScreen={() => {
                                        dispatch(
                                            actions.showFileViewerPopup({
                                                active: true,
                                                options: {
                                                    bcName,
                                                    type: 'file-viewer',
                                                    calleeFieldKey: fieldName,
                                                    mode: 'onlyFullscreen'
                                                },
                                                calleeWidgetName: widgetName as string
                                            })
                                        )
                                    }}
                                />
                            ) : null
                        }
                    />
                </ArrowPagination>
            </ResizeObserver>
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
                addedFileList={getAddedFileList()}
                onClose={clearAddedFiles}
                successHint={t('The file has been uploaded. Please save the changes')}
                data-test-notification-inner-container={true}
                data-test-notification-for-field={true}
                data-test-field-key={fieldMeta.key}
                data-test-widget-name={widgetName}
            />
        </>
    )
}

export default React.memo(FileUploadContainer)

// The hook is needed so that before opening a popup, if there is unsaved data in the table row being edited, the popup will not open until the data is saved or deleted (internalFormWidgetMiddleware)
export const useFileIconClick = (widgetName: string, bcName: string, recordId: string, fieldName: string, mode?: FileViewerMode) => {
    const dispatch = useDispatch()
    const currentCursor = useAppSelector(state => state.screen.bo.bc[bcName]?.cursor)
    const [wasClick, setWasClick] = useState(false)

    const handleFileIconClick = useCallback(() => {
        setWasClick(true)
    }, [])

    const previousCursor = usePrevious(currentCursor)

    useEffect(() => {
        if (currentCursor !== recordId && wasClick) {
            dispatch(actions.bcSelectRecord({ bcName, cursor: recordId }))
        }
    }, [bcName, currentCursor, dispatch, recordId, wasClick])

    const widget = useAppSelector(state => state.view.widgets.find(widget => widget.name === widgetName))

    const { internalWidget } = useInternalWidgetSelector(widget, 'popup')

    useEffect(() => {
        if (currentCursor === recordId && wasClick) {
            setWasClick(false)

            dispatch(
                actions.showFileViewerPopup({
                    active: true,
                    options: {
                        bcName,
                        type: 'file-viewer',
                        calleeFieldKey: fieldName,
                        mode
                    },
                    calleeWidgetName: widgetName as string
                })
            )
        } else if (currentCursor !== previousCursor && wasClick) {
            setWasClick(false)
        }
    }, [
        currentCursor,
        previousCursor,
        dispatch,
        fieldName,
        internalWidget?.bcName,
        internalWidget?.name,
        recordId,
        wasClick,
        widgetName,
        mode
    ])

    return handleFileIconClick
}
