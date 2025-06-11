import React, { forwardRef, useCallback } from 'react'
import { useAppSelector } from '@store'
import { FileUploadFieldMeta } from '@interfaces/widget'
import { selectBcData, selectBcRecordPendingDataChanges } from '@selectors/selectors'
import { applyParams, getFileUploadEndpoint } from '@utils/api'
import { useFileIconClick } from '@fields/FileUpload/FileUploadContainer'
import FileViewer, { FileViewerProps, FileViewerRef } from '@components/FileViewer/FileViewer'
import ImageControlButtons from '@components/FileViewer/ImageControlButtons/ImageControlButtons'
import { actions } from '@cxbox-ui/core'
import { useDispatch } from 'react-redux'
import { PopupData } from '@interfaces/view'

interface FileUploadFieldProps {
    id: string
    widgetName: string
    bcName: string
    widgetField: FileUploadFieldMeta
    width: number
    height: number
    disabledViewer?: boolean
    imageControlEnabled?: boolean
    onFileClick?: (() => void) | null
}

const FileUploadField = forwardRef<FileViewerRef | undefined, FileUploadFieldProps>(
    ({ widgetName, bcName, id, widgetField, width, height, onFileClick, imageControlEnabled = false }, ref) => {
        const { key: fieldName, fileIdKey, fileSource = '', preview } = widgetField || {}

        const pendingDataChanges = useAppSelector(state => selectBcRecordPendingDataChanges(state, bcName, id))
        const currentRecord = useAppSelector(state => selectBcData(state, bcName)?.find(item => item.id === id))

        const getDownloadUrl = (params: { id: string; source: string }) => {
            return params.id ? applyParams(getFileUploadEndpoint(), params) : undefined
        }
        const getFieldValue = (fieldKey: string | undefined) => {
            if (!fieldKey) {
                return
            }

            return pendingDataChanges?.[fieldKey] !== undefined ? pendingDataChanges?.[fieldKey] : currentRecord?.[fieldKey]
        }

        const fileName = getFieldValue(fieldName)
        const fileId = getFieldValue(fileIdKey)

        const downloadUrl = getDownloadUrl({
            source: fileSource,
            id: fileId?.toString() as string
        })

        const fileIconHandler = useFileIconClick(widgetName, bcName, id, fieldName as string, 'onlyFullscreen')

        const handleFileClick = onFileClick ? onFileClick : preview?.enabled && onFileClick !== null ? fileIconHandler : undefined
        const dispatch = useDispatch()
        const popupData = useAppSelector(state => state.view.popupData) as PopupData

        const imageFooterRender: FileViewerProps['footer'] = useCallback(
            ({ displayType, imageControl }) =>
                displayType === 'image' && imageControl ? (
                    <ImageControlButtons
                        imageControl={imageControl}
                        fullScreen={popupData.options?.type === 'file-viewer'}
                        onChangeFullScreen={value => {
                            if (value) {
                                fileIconHandler()
                            } else {
                                dispatch(actions.closeViewPopup({ bcName }))
                            }
                        }}
                    />
                ) : null,
            [bcName, dispatch, fileIconHandler, popupData.options?.type]
        )

        return (
            <FileViewer
                imageControlEnabled={imageControlEnabled}
                ref={ref}
                fileName={fileName as string}
                url={downloadUrl}
                view="preview"
                width={width}
                height={height}
                onClick={handleFileClick}
                onChangeFullScreen={fileIconHandler}
                footer={imageFooterRender}
            />
        )
    }
)

export default FileUploadField
