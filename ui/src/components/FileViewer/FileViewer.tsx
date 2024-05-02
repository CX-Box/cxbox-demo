import React, { CSSProperties, forwardRef, useImperativeHandle } from 'react'
import { fileViewerType, FileViewerType, getExtension } from '@utils/fileViewer'
import cn from 'classnames'
import { saveAs } from 'file-saver'
import 'rc-image/assets/index.css'
import styles from './FileViewer.less'
import { PdfViewer } from '@components/FileViewer/PdfViewer'
import { DOCUMENT_PAGE_WIDTH } from '@components/FileViewer/PdfViewer/constants'
import Empty from '@components/FileViewer/Empty/Empty'
import Image from './Image/Image'
import { useTranslation } from 'react-i18next'

export interface FileViewerProps {
    fileName: string
    url?: string
    view: 'compact' | 'full'
    alt?: string
    width: number
    height: number
    pageWidth?: number
    onDoubleClick?: () => void
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    className?: string
    style?: CSSProperties
}

export type FileViewerHandlers = {
    download: () => void
}

const FileViewer = forwardRef<FileViewerHandlers | undefined, FileViewerProps>(
    (
        { alt, url = '', height, width, onDoubleClick, onClick, style = {}, className, view, fileName, pageWidth = DOCUMENT_PAGE_WIDTH },
        ref
    ) => {
        useImperativeHandle(
            ref,
            () => {
                return {
                    download: () => {
                        saveAs(url, fileName)
                    }
                }
            },
            [fileName, url]
        )

        const displayType = url ? fileViewerType(fileName) : fileViewerType()

        const { t } = useTranslation()
        const isCompact = view === 'compact'
        const viewerMode = isCompact ? 'light' : 'dark'

        const viewerMap: Record<FileViewerType, JSX.Element | null> = {
            image: <Image alt={alt} src={url} mode={viewerMode} />,
            pdf: (
                <PdfViewer
                    displayMode="inline"
                    src={url}
                    width={width}
                    height={height}
                    hideToolbar={isCompact}
                    mode={viewerMode}
                    pageWidth={pageWidth}
                />
            ),
            other: <Empty type={getExtension(fileName)} size="big" mode={viewerMode} text={t('This file type cannot be viewed')} />
        }

        return (
            <div
                className={cn(styles.root, className, styles[view])}
                onDoubleClick={onDoubleClick}
                onClick={onClick}
                style={{ ...style, width, height }}
            >
                {viewerMap[displayType]}
            </div>
        )
    }
)

export default FileViewer
