import React, { CSSProperties, forwardRef, useImperativeHandle } from 'react'
import { getFileDisplayType, getUrlExtension } from '@utils/documentPreview'
import Image from 'rc-image'
import styles from './FileViewer.less'
import ReactFileViewer from './ReactFileViewer'
import cn from 'classnames'
import PdfViewer from './PdfViewer'
import parseDataUrl from 'parse-data-url'
import { useObjectUrlForBase64 } from '@hooks/useObjectUrlForBase64'
import { extension, lookup } from 'mime-types'
import { saveAs } from 'file-saver'
import { DocumentPreviewType } from '@interfaces/widget'

interface FileViewerProps {
    width?: string
    height?: string
    /**
     * data url or file url
     */
    url?: string
    contentType?: string
    previewType: DocumentPreviewType
    alt?: string
    onDoubleClick?: () => void
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    style?: CSSProperties
    className?: string
    /**
     * only works with pdf
     */
    hideToolbar?: boolean
}

export type FileViewerHandlers = {
    download: (fileNameWithoutExt: string) => void
}

const FileViewer = forwardRef<FileViewerHandlers | undefined, FileViewerProps>(
    (
        {
            previewType,
            contentType,
            alt,
            url = '',
            height = '510px',
            width = '100%',
            onDoubleClick,
            onClick,
            style = {},
            className,
            hideToolbar
        },
        ref
    ) => {
        let viewer: JSX.Element

        const { url: normalizedUrl = '', calculatedContentType, extension } = useUrlAdapter(previewType, url, contentType)

        useImperativeHandle(
            ref,
            () => {
                return {
                    download: (fileNameWithoutExt: string) => {
                        saveAs(normalizedUrl, `${fileNameWithoutExt}.${extension}`)
                    }
                }
            },
            [extension, normalizedUrl]
        )

        const displayType = getFileDisplayType(calculatedContentType)

        switch (displayType) {
            case 'image': {
                viewer = (
                    <Image
                        preview={false}
                        alt={alt}
                        src={normalizedUrl}
                        style={{ maxHeight: height }}
                        wrapperClassName={styles.imageWrapper}
                    />
                )
                break
            }
            case 'pdf': {
                viewer = <PdfViewer src={normalizedUrl} width={width} height={height} hideToolbar={hideToolbar} />
                break
            }
            default: {
                viewer = <ReactFileViewer url={normalizedUrl} extension={extension} height={height} />

                break
            }
        }

        return (
            <div
                className={cn(styles.root, className, {
                    [styles.pdf]: displayType === 'pdf',
                    [styles.image]: displayType === 'image'
                })}
                onDoubleClick={onDoubleClick}
                onClick={onClick}
                style={style}
            >
                {viewer}
            </div>
        )
    }
)

export default FileViewer

/**
 * Checks the type of url (file url, data url). file url is returned unchanged. If data-url(base64), then an objectUrl is created based on it.
 *
 * @param fileOrDataUrl
 */
function useUrlAdapter(previewType: DocumentPreviewType, fileOrDataUrl: string, contentType?: string) {
    const parsedDataUrl = parseDataUrl(fileOrDataUrl)
    const { objectUrl, file } = useObjectUrlForBase64(
        parsedDataUrl && parsedDataUrl.base64 ? parsedDataUrl.data : null,
        parsedDataUrl && parsedDataUrl.base64 ? parsedDataUrl.contentType : ''
    )

    let calculatedContentType = contentType

    if (previewType === 'fileUrl') {
        calculatedContentType = lookup(getUrlExtension(fileOrDataUrl)) || ''
    }

    if (parsedDataUrl && parsedDataUrl.base64) {
        calculatedContentType = parsedDataUrl.contentType
    }

    return {
        url: parsedDataUrl && parsedDataUrl.base64 ? objectUrl : fileOrDataUrl,
        calculatedContentType: calculatedContentType,
        extension: (contentType && extension(contentType)) || '',
        fileExists: file instanceof Blob
    }
}
