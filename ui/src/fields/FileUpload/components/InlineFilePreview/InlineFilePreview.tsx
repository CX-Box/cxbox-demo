import React, { useCallback } from 'react'
import { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { useTranslation } from 'react-i18next'
import FileViewer from '@components/FileViewer/FileViewer'
import FullscreenLayout from '@components/FileViewerContainer/components/FullscreenLayout'
import Header from '@components/FileViewerContainer/components/Header'
import Button from '@components/ui/Button/Button'
import Upload from '@components/Upload'
import { useFlatFormFields } from '@hooks/useFlatFormFields'
import { useFileFieldData } from '@hooks/useFileFieldData'
import { useVisibility } from '@hooks/useVisibility'
import { useWindowSize } from '@hooks/useWindowSize'
import { useAppDispatch, useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { trimString } from '@utils/fileViewer'
import { actions } from '@actions'
import { WidgetField } from '@cxbox-ui/schema'
import { FileUploadFieldMeta } from '@interfaces/widget'
import { selectBc, selectWidget } from '@selectors/selectors'
import styles from './InlineFilePreview.less'
import ImageControlButtons from '@components/FileViewer/components/ImageControlButtons/ImageControlButtons'
import { TEMP_DEFAULT_ROW_SIZE } from '@constants/fileViewer'

interface InlineFilePreviewProps {
    widgetName?: string
    fieldKey?: string
    disabled?: boolean
    // hides the lower image control buttons (rotate/zoom/rollback/fullscreen)
    hideImageControl?: boolean
    fileAccept?: string
    uploadUrl?: string
    customRequest?: UploadProps['customRequest']
    beforeUpload?: UploadProps['beforeUpload']
    onStartUpload?: (file: UploadFile) => void
    onProgressUpload?: (event: ProgressEvent & { percent?: number }, file: UploadFile) => void
    onUploadSuccess?: (response: any, file: UploadFile) => void
    onUploadFailed?: (error: any, response: any, file: UploadFile) => void
    onFileDelete?: () => void
}

function InlineFilePreview({
    widgetName,
    fieldKey = '',
    disabled = false,
    hideImageControl,
    fileAccept,
    uploadUrl,
    customRequest,
    beforeUpload,
    onStartUpload,
    onProgressUpload,
    onUploadSuccess,
    onUploadFailed,
    onFileDelete
}: InlineFilePreviewProps) {
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
    void useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl])

    const { visibility: fullscreen, changeVisibility: setFullscreen } = useVisibility(false)
    const fullscreenWindowSize = useWindowSize()
    const handleCloseFullscreen = useCallback(() => setFullscreen(false), [setFullscreen])
    const handleDownload = useCallback(() => {
        if (downloadUrl) {
            dispatch(actions.downloadFileByUrl({ url: downloadUrl, name: fileName }))
        }
    }, [dispatch, downloadUrl, fileName])

    const renderImageFooter = useCallback(
        ({ displayType, imageControl }) => {
            if (hideImageControl) {
                return null
            }

            return displayType === 'image' ? (
                <ImageControlButtons fullScreen={fullscreen} imageControl={imageControl} onChangeFullScreen={setFullscreen} />
            ) : null
        },
        [fullscreen, setFullscreen, hideImageControl]
    )

    const previewHeight = `${10 * TEMP_DEFAULT_ROW_SIZE}px`

    if (!fieldKey) {
        return null
    }

    const hasUpload = !!customRequest && !!beforeUpload && !!onStartUpload && !!onProgressUpload && !!onUploadSuccess && !!onUploadFailed
    const uploadProps = hasUpload
        ? {
              name: 'file',
              accept: fileAccept,
              showUploadList: false,
              action: uploadUrl,
              customRequest,
              beforeUpload,
              onStart: onStartUpload,
              onProgress: onProgressUpload,
              onError: onUploadFailed,
              onSuccess: onUploadSuccess
          }
        : undefined

    return (
        <div className={styles.wrapper}>
            <div className={styles.topActions}>
                <div className={styles.textBlock}>
                    {fileName && (
                        <span className={styles.fileName} title={fileName}>
                            {trimString(fileName)}
                        </span>
                    )}
                </div>
                <div className={styles.operationsBlock}>
                    {!disabled && hasUpload && (
                        <Upload {...uploadProps}>
                            <Button
                                type="link"
                                title={t('Upload')}
                                icon="upload"
                                style={{
                                    height: 20,
                                    lineHeight: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0
                                }}
                            />
                        </Upload>
                    )}
                    {downloadUrl && (
                        <Button
                            className={styles.button}
                            icon="download"
                            title={t('Download')}
                            onClick={e => {
                                e.stopPropagation()
                                handleDownload()
                            }}
                            type="link"
                            removeIndentation
                        />
                    )}
                    <Button
                        className={styles.button}
                        icon="fullscreen"
                        title={t('Fullscreen')}
                        onClick={() => setFullscreen(true)}
                        type="link"
                        removeIndentation
                    />
                    {downloadUrl && !disabled && onFileDelete && (
                        <Button
                            className={styles.button}
                            icon="delete"
                            title={t('Delete')}
                            onClick={e => {
                                e.stopPropagation()
                                onFileDelete()
                            }}
                            type="link"
                            removeIndentation
                        />
                    )}
                </div>
            </div>
            <div className={styles.container} style={{ height: previewHeight }}>
                <FileViewer
                    fileName={fileName}
                    url={downloadUrl}
                    view="compact"
                    width={'100%'}
                    height={'100%'}
                    imageControlEnabled={!hideImageControl}
                    footer={renderImageFooter}
                />
            </div>

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
                        width={fullscreenWindowSize.width ?? 0}
                        height={fullscreenWindowSize.height ? fullscreenWindowSize.height - 80 : 0}
                        imageControlEnabled={!hideImageControl}
                        footer={renderImageFooter}
                    />
                }
            />
        </div>
    )
}

export default React.memo(InlineFilePreview)
