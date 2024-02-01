import React, { CSSProperties, forwardRef, useImperativeHandle } from 'react'
import { getFileDisplayType, getUrlExtension } from '@utils/documentPreview'
import Image from 'rc-image'
import styles from './FileViewer.less'
import ReactFileViewer from './ReactFileViewer'
import cn from 'classnames'
import PdfViewer from './PdfViewer'
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

        const { calculatedContentType, extension } = useContentTypeAdapter(previewType, url, contentType)

        useImperativeHandle(
            ref,
            () => {
                return {
                    download: (fileNameWithoutExt: string) => {
                        saveAs(url, `${fileNameWithoutExt}.${extension}`)
                    }
                }
            },
            [extension, url]
        )

        const displayType = getFileDisplayType(calculatedContentType)

        switch (displayType) {
            case 'image': {
                viewer = <Image preview={false} alt={alt} src={url} style={{ maxHeight: height }} wrapperClassName={styles.imageWrapper} />
                break
            }
            case 'pdf': {
                viewer = <PdfViewer src={url} width={width} height={height} hideToolbar={hideToolbar} />
                break
            }
            default: {
                viewer = <ReactFileViewer url={url} extension={extension} height={height} />

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

function useContentTypeAdapter(previewType: DocumentPreviewType, fileOrDataUrl: string, contentType?: string) {
    let calculatedContentType = contentType

    if (previewType === 'fileUrl') {
        calculatedContentType = lookup(getUrlExtension(fileOrDataUrl)) || ''
    }

    return {
        calculatedContentType: calculatedContentType,
        extension: (calculatedContentType && extension(calculatedContentType)) || ''
    }
}
