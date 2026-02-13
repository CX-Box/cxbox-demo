import React, { CSSProperties, forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { fileViewerType, FileViewerType } from '@utils/fileViewer'
import cn from 'classnames'
import styles from './FileViewer.less'
import { DOCUMENT_PAGE_WIDTH } from '@constants/fileViewer'
import { useTranslation } from 'react-i18next'
import { ImageControl, useImageControl } from '@hooks/image'
import { useAppDispatch } from '@store'
import { actions } from '@actions'
import { useFileUrl } from '@components/FileViewer/core/useFileUrl'
import { getFileViewer } from './core/registry'
import { PreviewMode, ViewType } from '@components/FileViewer/core/viewerTypes'

const darkView: ViewType[] = ['full']

export interface FileViewerProps {
    fileName: string
    url?: string
    view: ViewType
    previewMode?: PreviewMode
    alt?: string
    width: string | number
    height: string | number
    pageWidth?: number
    onDoubleClick?: () => void
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    className?: string
    style?: CSSProperties
    imageControlEnabled?: boolean
    footer?: (params: { displayType: FileViewerType; imageControl?: ImageControl }) => JSX.Element | null
}

export type FileViewerRef = {
    displayType: FileViewerType
    download: () => void
    imageControl: ImageControl
}

const FileViewer = forwardRef<FileViewerRef | undefined, FileViewerProps>(
    (
        {
            alt,
            url = '',
            height,
            width,
            onDoubleClick,
            onClick,
            style = {},
            className,
            view,
            previewMode = 'auto',
            fileName,
            pageWidth = DOCUMENT_PAGE_WIDTH,
            imageControlEnabled = false,
            footer
        },
        ref
    ) => {
        const isIconOnlyPreview = view === 'preview' && previewMode === 'iconOnly'

        const displayType = useMemo(() => {
            if (isIconOnlyPreview) {
                return fileViewerType()
            }

            return url ? fileViewerType(fileName) : fileViewerType()
        }, [isIconOnlyPreview, url, fileName])

        const dispatch = useAppDispatch()

        const handleDownload = React.useCallback(() => {
            if (url) {
                dispatch(
                    actions.downloadFileByUrl({
                        url,
                        name: fileName
                    })
                )
            }
        }, [dispatch, url, fileName])

        const imageRef = useRef<HTMLImageElement>(null)

        const { blobUrl, loading } = useFileUrl(url)

        const imageControl = useImageControl(imageRef, imageControlEnabled, blobUrl)

        useImperativeHandle(
            ref,
            () => ({
                displayType,
                get imageControl() {
                    return imageControl as ImageControl
                },
                download: handleDownload
            }),
            [displayType, handleDownload, imageControl]
        )

        const { t } = useTranslation()

        const viewerMode = darkView.includes(view) ? 'dark' : 'light'

        const Viewer = useMemo(() => getFileViewer(displayType), [displayType])

        const wrapperHeightStyle: Pick<CSSProperties, 'height' | 'maxHeight'> = displayType === 'audio' ? { maxHeight: height } : { height }
        const wrapperStyle: CSSProperties = { ...style, width, ...wrapperHeightStyle }

        return (
            <div
                className={cn(styles.root, className, styles[view], styles[displayType])}
                onDoubleClick={onDoubleClick}
                onClick={onClick}
                style={wrapperStyle}
            >
                {(
                    <Viewer
                        viewerRef={imageRef}
                        fileName={fileName}
                        url={blobUrl}
                        loading={loading}
                        view={view}
                        width={width}
                        height={height}
                        alt={alt}
                        pageWidth={pageWidth}
                        viewerMode={viewerMode}
                    />
                ) ?? <div>{t('This file type cannot be viewed')}</div>}
                {footer?.({ displayType, imageControl })}
            </div>
        )
    }
)

export default React.memo(FileViewer)
