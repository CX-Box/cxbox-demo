import React, { forwardRef, useCallback, useMemo } from 'react'
import { useAppSelector } from '@store'
import { FileUploadFieldMeta } from '@interfaces/widget'
import { useFileIconClick } from '@fields/FileUpload/hooks'
import FileViewer, { FileViewerProps, FileViewerRef } from '@components/FileViewer/FileViewer'
import ImageControlButtons from '@components/FileViewer/components/ImageControlButtons/ImageControlButtons'
import { actions } from '@cxbox-ui/core'
import { useDispatch } from 'react-redux'
import { useFileFieldData } from '@hooks/useFileFieldData'

interface FilePreviewProps extends Pick<FileViewerProps, 'previewMode'> {
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

const FilePreview = forwardRef<FileViewerRef | undefined, FilePreviewProps>(
    ({ widgetName, bcName, id, widgetField, width, height, onFileClick, imageControlEnabled = false, previewMode = 'auto' }, ref) => {
        const dispatch = useDispatch()
        const { key: fieldName, fileIdKey, fileSource = '', preview } = widgetField || {}
        const isFullScreen = useAppSelector(state => state.view.popupData?.options?.type === 'file-viewer')

        const { downloadUrl, fileName } = useFileFieldData(bcName, id, fieldName, fileIdKey, fileSource)

        const handleFileIconClick = useFileIconClick(widgetName, bcName, id, fieldName as string, 'onlyFullscreen')

        const handleFileClick = useMemo(() => {
            if (onFileClick) {
                return onFileClick
            }
            if (onFileClick === null) {
                return undefined
            }
            return preview?.enabled ? handleFileIconClick : undefined
        }, [onFileClick, preview?.enabled, handleFileIconClick])

        const renderFileViewerFooter = useCallback(
            ({ displayType, imageControl }) => {
                if (displayType !== 'image' || !imageControl) {
                    return null
                }

                return (
                    <ImageControlButtons
                        imageControl={imageControl}
                        fullScreen={isFullScreen}
                        onChangeFullScreen={active => (active ? handleFileIconClick() : dispatch(actions.closeViewPopup({ bcName })))}
                    />
                )
            },
            [isFullScreen, handleFileIconClick, dispatch, bcName]
        )

        return (
            <FileViewer
                imageControlEnabled={imageControlEnabled}
                ref={ref}
                fileName={fileName ?? ''}
                url={downloadUrl}
                view="preview"
                previewMode={previewMode}
                width={width}
                height={height}
                onClick={handleFileClick}
                footer={renderFileViewerFooter}
            />
        )
    }
)

export default FilePreview
