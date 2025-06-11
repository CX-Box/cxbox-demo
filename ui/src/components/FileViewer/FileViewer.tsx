import React, { CSSProperties, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { fileViewerType, FileViewerType, getExtension } from '@utils/fileViewer'
import cn from 'classnames'
import styles from './FileViewer.less'
import { PdfViewer } from '@components/FileViewer/PdfViewer'
import { DOCUMENT_PAGE_WIDTH } from '@constants/fileViewer'
import Empty from '@components/FileViewer/Empty/Empty'
import Image from './Image/Image'
import { useTranslation } from 'react-i18next'
import { CxBoxApiInstance } from '../../api'
import { createLocalCache } from '@utils/localCache'
import { ImageControl } from '@hooks/image'

export interface FileViewerProps {
    fileName: string
    url?: string
    view: 'preview' | 'compact' | 'full'
    alt?: string
    width: number
    height: number
    pageWidth?: number
    onDoubleClick?: () => void
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    className?: string
    style?: CSSProperties
    imageControlEnabled?: boolean
    onChangeFullScreen?: () => void
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
            fileName,
            pageWidth = DOCUMENT_PAGE_WIDTH,
            imageControlEnabled = false,
            onChangeFullScreen,
            footer
        },
        ref
    ) => {
        const displayType = url ? fileViewerType(fileName) : fileViewerType()

        const imageControlRef = useRef<ImageControl>()

        useImperativeHandle(
            ref,
            () => {
                return {
                    displayType,
                    imageControl: imageControlRef.current,
                    download: () => {
                        url && CxBoxApiInstance.saveBlob(url, fileName)
                    }
                }
            },
            [displayType, fileName, url]
        )

        const { t } = useTranslation()

        const isPreview = view === 'preview'
        const isCompact = view === 'compact'
        const viewerMode = isCompact || isPreview ? 'light' : 'dark'

        const { blobUrl, loading } = useFileUrl(url)

        const viewerMap: Record<FileViewerType, JSX.Element | null> = {
            image: (
                <Image
                    ref={imageControlRef}
                    imageControlEnabled={imageControlEnabled}
                    alt={alt}
                    src={blobUrl}
                    mode={viewerMode}
                    spinning={loading}
                    onChangeFullScreen={onChangeFullScreen}
                />
            ),
            pdf: (
                <PdfViewer
                    displayMode={isPreview ? 'preview' : 'inline'}
                    src={blobUrl}
                    width={width}
                    height={height}
                    hideToolbar={isCompact || isPreview}
                    mode={viewerMode}
                    pageWidth={pageWidth}
                    spinning={loading}
                />
            ),
            other: (
                <Empty
                    type={getExtension(fileName)}
                    size="big"
                    mode={viewerMode}
                    text={t('This file type cannot be viewed')}
                    iconOnly={isPreview}
                />
            )
        }

        return (
            <div
                className={cn(styles.root, className, styles[view], styles[displayType], className)}
                onDoubleClick={onDoubleClick}
                onClick={onClick}
                style={{ ...style, width, height }}
            >
                {viewerMap[displayType]}
                {footer?.({ displayType, imageControl: imageControlRef.current })}
            </div>
        )
    }
)

export default FileViewer

const localCache = createLocalCache<Blob>()

const useFileUrl = (url: string | undefined) => {
    const [blobUrl, setBlobUrl] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const blobUrlRef = useRef<string>('')

    const changeBlobUrl = useCallback((blobUrl: string) => {
        blobUrlRef.current && URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = ''

        blobUrlRef.current = blobUrl
        setBlobUrl(blobUrl)
        setLoading(false)
    }, [])

    const clearBlobUrl = useCallback(() => {
        changeBlobUrl('')
    }, [changeBlobUrl])

    useEffect(() => {
        let clear: (() => void) | undefined

        if (url) {
            setLoading(true)

            clear = localCache.create(url, (cachedBlob, setCache) => {
                if (!cachedBlob) {
                    CxBoxApiInstance.getBlob(url, { preview: true }).then(response => {
                        setCache(response.data)

                        changeBlobUrl(URL.createObjectURL(response.data))
                    })
                } else {
                    changeBlobUrl(URL.createObjectURL(cachedBlob))
                }

                return () => {
                    clearBlobUrl()
                }
            })
        }

        return () => {
            clear?.()
        }
    }, [changeBlobUrl, clearBlobUrl, url])

    return { blobUrl, loading }
}
