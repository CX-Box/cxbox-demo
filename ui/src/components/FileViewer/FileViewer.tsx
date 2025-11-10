import React, { CSSProperties, forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fileViewerType, FileViewerType, getExtension } from '@utils/fileViewer'
import cn from 'classnames'
import { PdfViewer } from '@components/FileViewer/PdfViewer'
import { DOCUMENT_PAGE_WIDTH } from '@components/FileViewer/PdfViewer/constants'
import Empty from '@components/FileViewer/Empty/Empty'
import Image from './Image/Image'
import { CxBoxApiInstance } from '../../api'
import { actions, utils } from '@cxbox-ui/core'
import { useAppDispatch } from '@store'
import styles from './FileViewer.less'
import { Audio } from '@components/FileViewer/Audio/Audio'

export interface FileViewerProps {
    fileName: string
    url?: string
    view: 'compact' | 'full'
    alt?: string
    width: string | number
    height: string | number
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
        const dispatch = useAppDispatch()

        useImperativeHandle(
            ref,
            () => {
                return {
                    download: () => {
                        if (url) {
                            dispatch(
                                actions.downloadFileByUrl({
                                    url,
                                    name: fileName
                                })
                            )
                        }
                    }
                }
            },
            [dispatch, fileName, url]
        )

        const displayType = url ? fileViewerType(fileName) : fileViewerType()

        const { t } = useTranslation()
        const isCompact = view === 'compact'
        const viewerMode = isCompact ? 'light' : 'dark'

        const [blobUrl, setBlobUrl] = useState<string>('')

        useEffect(() => {
            let currentBlobUrl: string = ''

            if (url) {
                CxBoxApiInstance.getBlob(url, { preview: true })
                    .then(response => {
                        currentBlobUrl = URL.createObjectURL(response.data)
                        setBlobUrl(currentBlobUrl)
                    })
                    .catch(error => {
                        setBlobUrl('')
                        const apiErrorAction = utils.createApiError(error)

                        if (apiErrorAction) {
                            dispatch(apiErrorAction)
                        }
                    })
            }

            return () => {
                if (currentBlobUrl) {
                    URL.revokeObjectURL(currentBlobUrl)
                    setBlobUrl('')
                }
            }
        }, [dispatch, url])

        const viewerMap: Record<FileViewerType, JSX.Element | null> = {
            image: <Image alt={alt} src={blobUrl} mode={viewerMode} />,
            pdf: blobUrl ? (
                <PdfViewer
                    displayMode="inline"
                    src={blobUrl}
                    width={width}
                    height={height}
                    hideToolbar={isCompact}
                    mode={viewerMode}
                    pageWidth={pageWidth}
                />
            ) : null,
            audio: <Audio src={blobUrl} />,
            other: (
                <Empty
                    type={getExtension(fileName)}
                    size="big"
                    mode={viewerMode}
                    text={t(blobUrl ? 'This file type cannot be viewed' : 'There is no file in this row')}
                />
            )
        }

        return (
            <div
                className={cn(styles.root, className, styles[view])}
                onDoubleClick={onDoubleClick}
                onClick={onClick}
                style={{ ...style, width, maxHeight: height }}
            >
                {viewerMap[displayType]}
            </div>
        )
    }
)

export default FileViewer
