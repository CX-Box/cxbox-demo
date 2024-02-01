import React, { useCallback, useRef, useState } from 'react'
import { DocumentPreviewFieldMeta } from '@interfaces/widget'
import FileViewer, { FileViewerHandlers } from '../../components/FileViewer/FileViewer'
import { Icon, Skeleton } from 'antd'
import { Button } from 'antd'
import cn from 'classnames'
import styles from './DocumentPreview.less'
import { shallowEqual } from 'react-redux'
import { createDataUrl, isImageFileType } from '@utils/documentPreview'
import { BaseFieldProps } from '@cxboxComponents/Field/Field'
import { useAppSelector } from '@store'

interface DocumentPreviewProps extends Omit<BaseFieldProps, 'meta'> {
    meta: DocumentPreviewFieldMeta
    value?: string
}

function DocumentPreview({ value, meta: fieldMeta, widgetName }: DocumentPreviewProps) {
    const previewType = fieldMeta.previewType
    const fieldKeyForContentType = fieldMeta.fieldKeyForContentType
    const fieldKeyForFileName = fieldMeta.fieldKeyForFileName
    const { contentType, fileName } = useAppSelector(state => {
        const widget = state.view.widgets.find(widget => widget.name === widgetName)
        const bc = widget?.bcName ? state.screen.bo.bc[widget.bcName] : undefined
        const record = bc ? state.data[bc.name]?.find(i => i.id === bc.cursor) : undefined

        return {
            contentType: record?.[fieldKeyForContentType as string] as string,
            fileName: record?.[fieldKeyForFileName as string] as string
        }
    }, shallowEqual)

    const { zoomIn, zoomOut, resetZoom, zoom, toggleFullScreen, isFullScreen, isNormalZoom, isMinZoom, isMaxZoom } = useFileOperation()

    const fileViewerRef = useRef<FileViewerHandlers | undefined>()

    const handleDownloadFile = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault()
        fileViewerRef.current?.download(fileName)
    }
    const url = previewType === 'base64' ? createDataUrl(contentType, value) : value
    // TODO: Rewrite the implementation. Use one FileViewer component. Combine simpleViewer and fullScreenViewer.
    const simpleViewer = (
        <>
            {url && !isFullScreen ? (
                <FileViewer
                    ref={fileViewerRef}
                    onDoubleClick={toggleFullScreen}
                    previewType={previewType}
                    url={url}
                    contentType={contentType}
                    hideToolbar={true}
                />
            ) : (
                <Skeleton />
            )}
            <div className={styles.simpleToolBar}>
                <Button disabled={!url} onClick={toggleFullScreen}>
                    <Icon type="fullscreen" />
                </Button>
                <Button disabled={!url} onClick={handleDownloadFile}>
                    <Icon type="download" />
                </Button>
            </div>
        </>
    )

    const closeFullScreen = () => {
        resetZoom()
        toggleFullScreen()
    }

    const handleOuterZoneClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!event.isDefaultPrevented()) {
            closeFullScreen()
        }
    }

    const handleCloseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault()
        closeFullScreen()
    }

    const handleZoomIn = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault()
        zoomIn()
    }

    const handleZoomOut = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault()
        zoomOut()
    }

    const handleZoomReset = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault()
        resetZoom()
    }

    const fullScreenViewer =
        url && isFullScreen ? (
            <div className={cn(styles.fullScreen)} onClick={handleOuterZoneClick}>
                <Button className={cn(styles.closeButton)} type="dashed" shape="circle" icon="close" onClick={handleCloseClick} />
                <FileViewer
                    ref={fileViewerRef}
                    className={cn(styles.fileViewer, styles.full)}
                    previewType={previewType}
                    url={url}
                    contentType={contentType}
                    height={'80vh'}
                    onClick={event => event.preventDefault()}
                    style={{ transform: `scale(${zoom})` }}
                />
                {isImageFileType(contentType) ? (
                    <div className={cn(styles.fullScreenToolbar)}>
                        <Button type="dashed" shape="circle" icon="download" onClick={handleDownloadFile} disabled={!url} />
                        <Button type="dashed" shape="circle" icon="zoom-in" onClick={handleZoomIn} disabled={isMaxZoom()} />
                        <Button type="dashed" shape="circle" icon="reload" onClick={handleZoomReset} disabled={isNormalZoom()} />
                        <Button type="dashed" shape="circle" icon="zoom-out" onClick={handleZoomOut} disabled={isMinZoom()} />
                    </div>
                ) : null}
            </div>
        ) : null

    return (
        <div>
            {simpleViewer}
            {fullScreenViewer}
        </div>
    )
}

export default React.memo(DocumentPreview)

function useFileOperation() {
    const [zoom, setZoom] = useState(1)
    const [isFullScreen, setIsFullScreen] = useState(false)

    const zoomIn = useCallback(() => {
        setZoom(prev => +(prev + 0.1).toFixed(1))
    }, [])

    const zoomOut = useCallback(() => {
        setZoom(prev => +(prev - 0.1).toFixed(1))
    }, [])

    const resetZoom = useCallback(() => {
        setZoom(1)
    }, [])

    const toggleFullScreen = useCallback(() => {
        setIsFullScreen(prevValue => !prevValue)
    }, [])

    const isMaxZoom = useCallback(() => zoom === 3, [zoom])

    const isMinZoom = useCallback(() => zoom === 0.1, [zoom])

    const isNormalZoom = useCallback(() => zoom === 1, [zoom])

    return {
        zoom,
        isFullScreen,
        zoomIn,
        zoomOut,
        resetZoom,
        isMaxZoom,
        isMinZoom,
        isNormalZoom,
        toggleFullScreen
    }
}
