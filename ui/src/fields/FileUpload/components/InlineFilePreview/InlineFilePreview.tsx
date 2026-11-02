import React, { useCallback, useMemo } from 'react'
import { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import FileViewer from '@components/FileViewer/FileViewer'
import FullscreenLayout from '@components/FileViewerContainer/components/FullscreenLayout'
import Header, { HeaderOperation } from '@components/FileViewerContainer/components/Header'
import Button from '@components/ui/Button/Button'
import Upload from '@components/Upload'
import ArrowPagination from '@components/ui/ArrowPagination/ArrowPagination'
import { useFlatFormFields } from '@hooks/useFlatFormFields'
import { useFileFieldData } from '@hooks/useFileFieldData'
import { useArrowPagination } from '@components/ui/ArrowPagination/ArrowPagination.hooks'
import { useVisibility } from '@hooks/useVisibility'
import { useWindowSize } from '@hooks/useWindowSize'
import { useAppDispatch, useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { trimString } from '@utils/fileViewer'
import { actions } from '@actions'
import { WidgetField } from '@cxbox-ui/schema'
import { FileUploadFieldMeta } from '@interfaces/widget'
import { selectBc, selectBcDataItem, selectWidget } from '@selectors/selectors'
import styles from './InlineFilePreview.less'
import ImageControlButtons from '@components/FileViewer/components/ImageControlButtons/ImageControlButtons'
import { INLINE_PREVIEW_MIN_ROWS, TEMP_DEFAULT_ROW_SIZE } from '@constants/fileViewer'

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
    // height of the inline wrapper. Defaults to a fixed row height (the field case);
    // the FilePreview widget passes '100%' so the viewer fills its container.
    forceHeight?: string
    // enables record/file pagination across the field (the FilePreview widget case).
    pagination?: boolean
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
    onFileDelete,
    forceHeight,
    pagination = false
}: InlineFilePreviewProps) {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const widget = useAppSelector(selectWidget(widgetName))
    const flatFields = useFlatFormFields(widget?.fields || []) as WidgetField[]
    const widgetField = flatFields.find(field => field.key === fieldKey) as FileUploadFieldMeta | undefined

    const { fileSource, fileIdKey = '', preview, minRows } = widgetField ?? {}

    // the inline preview is not a popup: it always shows the active record
    const recordId = useAppSelector(state => selectBc(state, widget?.bcName)?.cursor)
    const record = useAppSelector(selectBcDataItem(widget?.bcName, recordId)) as Record<string, string> | undefined
    const { fileName = '', downloadUrl } = useFileFieldData(widget?.bcName, recordId, fieldKey, fileIdKey, fileSource)

    const bcName = widget?.bcName as string
    const bcUrl = buildBcUrl(bcName, true)
    void useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl])

    const paginationProps = useArrowPagination(widget, pagination ? undefined : '')

    const handleDownload = useCallback(() => {
        if (downloadUrl) {
            dispatch(actions.downloadFileByUrl({ url: downloadUrl, name: fileName }))
        }
    }, [dispatch, downloadUrl, fileName])

    const onDelete = useCallback(() => onFileDelete?.(), [onFileDelete])

    const { visibility: fullscreen, changeVisibility: setFullscreen } = useVisibility(false)
    const handleCloseFullscreen = useCallback(() => setFullscreen(false), [setFullscreen])
    const fullscreenWindowSize = useWindowSize()

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

    const title = useMemo(
        () => (preview?.titleKey ? record?.[preview.titleKey] : trimString(fileName)),
        [preview?.titleKey, record, fileName]
    )

    const hint = useMemo(() => (preview?.hintKey ? record?.[preview.hintKey] : undefined), [preview?.hintKey, record])

    const center = pagination ? (
        <div className={styles.headerCenter}>
            {t('number of total', {
                number: paginationProps.currentIndex + 1,
                total: paginationProps.total
            })}
        </div>
    ) : undefined

    const operations = useMemo<HeaderOperation[]>(() => {
        if (pagination) {
            return [
                { icon: 'fullscreen', onClick: () => setFullscreen(true), label: 'Fullscreen' },
                { icon: 'download', onClick: handleDownload, label: 'Download' }
            ]
        }

        const ops: HeaderOperation[] = []

        const addUploadOperation = customRequest && beforeUpload && onStartUpload && onProgressUpload && onUploadSuccess && onUploadFailed
        if (addUploadOperation && !disabled) {
            const uploadProps = {
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

            ops.push({
                node: (
                    <Upload className={styles.uploadWrapper} {...uploadProps}>
                        <Button type="link" removeIndentation title={t('Upload')} icon="upload" />
                    </Upload>
                )
            })
        }

        if (downloadUrl && !disabled && onFileDelete) {
            ops.push({ icon: 'delete', onClick: onDelete, title: t('Delete'), removeIndentation: true })
        }

        if (downloadUrl) {
            ops.push({ icon: 'download', onClick: handleDownload, title: t('Download'), removeIndentation: true })
            ops.push({ icon: 'fullscreen', onClick: () => setFullscreen(true), title: t('Fullscreen'), removeIndentation: true })
        }

        return ops
    }, [
        pagination,
        downloadUrl,
        disabled,
        onFileDelete,
        onDelete,
        handleDownload,
        setFullscreen,
        customRequest,
        beforeUpload,
        onStartUpload,
        onProgressUpload,
        onUploadSuccess,
        onUploadFailed,
        fileAccept,
        uploadUrl,
        t
    ])

    if (!fieldKey) {
        return null
    }

    const renderFullscreenContent = () => {
        const viewer = (
            <FileViewer
                fileName={fileName}
                url={downloadUrl}
                view="full"
                width={fullscreenWindowSize.width ?? 0}
                height={fullscreenWindowSize.height ? fullscreenWindowSize.height - 80 : 0}
                imageControlEnabled={!hideImageControl}
                footer={renderImageFooter}
            />
        )

        return pagination ? (
            <ArrowPagination mode="fullscreen" {...paginationProps}>
                {viewer}
            </ArrowPagination>
        ) : (
            viewer
        )
    }

    const inlineHeight = forceHeight ?? `${(minRows ?? INLINE_PREVIEW_MIN_ROWS) * TEMP_DEFAULT_ROW_SIZE}px`

    return (
        <div className={styles.wrapper} style={{ height: inlineHeight }}>
            <Header
                className={cn(!pagination && styles.fieldHeader)}
                theme="light"
                title={title}
                hint={hint}
                operations={operations}
                hideIfEmpty={true}
            />

            <div className={styles.body}>
                <FileViewer
                    fileName={fileName}
                    url={downloadUrl}
                    view="compact"
                    width="100%"
                    height="100%"
                    imageControlEnabled={!hideImageControl}
                    footer={renderImageFooter}
                />

                {pagination && (
                    <div className={styles.footer}>
                        <ArrowPagination {...paginationProps} />
                    </div>
                )}
            </div>

            <FullscreenLayout
                visible={fullscreen}
                title={
                    <Header
                        className={styles.fullscreenHeader}
                        theme="dark"
                        title={title}
                        hint={hint}
                        center={center}
                        operations={[{ icon: 'download', onClick: handleDownload, label: 'Download' }]}
                        onClose={handleCloseFullscreen}
                    />
                }
                content={renderFullscreenContent()}
            />
        </div>
    )
}

export default React.memo(InlineFilePreview)
