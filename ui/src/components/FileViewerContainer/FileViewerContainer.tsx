import React, { useCallback, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Popup from '@components/ui/Popup/Popup'
import FileViewer from '@components/FileViewer/FileViewer'
import ArrowPagination from '@components/ui/ArrowPagination/ArrowPagination'
import FullscreenLayout from './components/FullscreenLayout'
import { useAppSelector } from '@store'
import { useArrowPagination } from '@components/ui/ArrowPagination/ArrowPagination.hooks'
import { useWindowSize } from '@hooks/useWindowSize'
import { useVisibility } from '@components/widgets/Table/hooks/useVisibility'
import { trimString } from '@utils/fileViewer'
import { actions } from '@cxbox-ui/core'
import { WidgetField } from '@cxbox-ui/schema'
import { FileViewerPopupOptions } from '@interfaces/view'
import { AppWidgetMeta, FileUploadFieldMeta } from '@interfaces/widget'
import styles from './FileViewerContainer.less'
import { usePopupFormWidget } from '@components/FileViewerContainer/hooks/usePopupFormWidget'
import { selectBc, selectBcDataItem, selectWidget } from '@selectors/selectors'
import Header, { HeaderProps } from '@components/FileViewerContainer/components/Header'
import ImageControlButtons from '@components/FileViewer/components/ImageControlButtons/ImageControlButtons'
import { useFileFieldData } from '@hooks/useFileFieldData'
import InnerWidget from '@components/InnerWidget/InnerWidget'
import Operations from '@components/Operations/Operations'

const POPUP_WIDTH = 808
const VIEWER_WIDTH = 760
const VIEWER_HEIGHT = 760

interface FileViewerContainerProps {
    isInline?: boolean
    widgetName?: string
    fieldKey?: string
}

function FileViewerContainer({ isInline, widgetName, fieldKey }: FileViewerContainerProps) {
    const dispatch = useDispatch()
    const { t } = useTranslation()

    const popupData = useAppSelector(state => state.view.popupData)
    const { active, calleeWidgetName, options } = popupData ?? {}
    const { type, calleeFieldKey, mode } = (options as FileViewerPopupOptions) ?? {}

    const visible = isInline || active
    const fileFieldKey = fieldKey || calleeFieldKey

    const widget = useAppSelector(selectWidget(widgetName || calleeWidgetName))
    const widgetField = (widget?.fields as WidgetField[])?.find(field => field.key === fileFieldKey) as FileUploadFieldMeta | undefined
    const { fileSource, fileIdKey = '', preview } = widgetField ?? {}

    const cursor = useAppSelector(state => selectBc(state, widget?.bcName)?.cursor)
    const record = useAppSelector(selectBcDataItem(widget?.bcName, cursor)) as Record<string, string> | undefined

    const paginationProps = useArrowPagination(widget)
    const windowSize = useWindowSize()
    const { visibility: fullscreen, changeVisibility: setFullscreen } = useVisibility(false)
    const { internalWidget, isLoading, internalWidgetOperations } = usePopupFormWidget(widget as AppWidgetMeta)

    const { fileName = '', downloadUrl } = useFileFieldData(widget?.bcName, cursor, fileFieldKey, fileIdKey, fileSource)

    useEffect(() => {
        if (visible) {
            setFullscreen(mode === 'onlyFullscreen')
        }
    }, [mode, setFullscreen, visible])

    const handleCancel = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName: widget?.bcName }))
    }, [dispatch, widget?.bcName])

    const handleDownload = useCallback(() => {
        if (downloadUrl) {
            dispatch(
                actions.downloadFileByUrl({
                    url: downloadUrl,
                    name: fileName
                })
            )
        }
    }, [dispatch, downloadUrl, fileName])

    const commonHeaderProps: Pick<HeaderProps, 'title' | 'hint' | 'onDownload'> = useMemo(
        () => ({
            title: preview?.titleKey ? record?.[preview.titleKey] : trimString(fileName),
            hint: preview?.hintKey ? record?.[preview.hintKey] : undefined,
            onDownload: handleDownload
        }),
        [preview?.titleKey, preview?.hintKey, record, fileName, handleDownload]
    )

    const handleCloseFullscreen = useCallback(() => setFullscreen(false), [setFullscreen])

    const handleOpenFullscreen = useCallback(() => setFullscreen(true), [setFullscreen])

    const handleCloseFullscreenFromViewer = useCallback(() => {
        if (mode === 'onlyFullscreen') {
            handleCancel()
        } else {
            handleCloseFullscreen()
        }
    }, [mode, handleCancel, handleCloseFullscreen])

    const renderFileViewerFooter = useCallback(
        ({ displayType, imageControl }) => {
            if (displayType !== 'image' || !imageControl) {
                return null
            }

            return <ImageControlButtons imageControl={imageControl} fullScreen={false} onChangeFullScreen={handleOpenFullscreen} />
        },
        [handleOpenFullscreen]
    )

    const renderFullscreenFileViewerFooter = useCallback(
        ({ displayType, imageControl }) => {
            if (displayType !== 'image' || !imageControl) {
                return null
            }

            return (
                <ImageControlButtons imageControl={imageControl} fullScreen={true} onChangeFullScreen={handleCloseFullscreenFromViewer} />
            )
        },
        [handleCloseFullscreenFromViewer]
    )

    if (!isInline && (type !== 'file-viewer' || !visible)) {
        return null
    }

    return (
        <>
            <FullscreenLayout
                title={
                    <Header
                        {...commonHeaderProps}
                        className={styles.fullscreenHeader}
                        theme="dark"
                        center={
                            <div className={styles.headerCenter}>
                                {t('number of total', {
                                    number: paginationProps.currentIndex + 1,
                                    total: paginationProps.total
                                })}
                            </div>
                        }
                        onClose={mode === 'onlyFullscreen' ? handleCancel : handleCloseFullscreen}
                    />
                }
                content={
                    <ArrowPagination mode="fullscreen" {...paginationProps}>
                        <FileViewer
                            fileName={fileName}
                            url={downloadUrl}
                            view="full"
                            width={windowSize.width ?? 0}
                            height={windowSize.height ? windowSize.height - 80 : 0}
                            imageControlEnabled={true}
                            footer={renderFullscreenFileViewerFooter}
                        />
                    </ArrowPagination>
                }
                visible={visible && fullscreen}
            />

            {isInline ? (
                <>
                    <Header {...commonHeaderProps} className={styles.headerInline} theme="light" onFullscreen={handleOpenFullscreen} />

                    <FileViewer
                        className={styles.fileViewerInline}
                        fileName={fileName}
                        url={downloadUrl}
                        view="compact"
                        width={'100%'}
                        height={'100%'}
                    />

                    <div className={styles.footer}>
                        <ArrowPagination {...paginationProps} />
                    </div>
                </>
            ) : (
                <Popup
                    visible={visible && !fullscreen}
                    title={
                        <Header
                            {...commonHeaderProps}
                            className={styles.popupHeader}
                            theme="light"
                            onClose={handleCancel}
                            onFullscreen={() => setFullscreen(true)}
                        />
                    }
                    footer={null}
                    onCancel={handleCancel}
                    width={POPUP_WIDTH}
                    className={styles.popup}
                >
                    <div style={{ width: VIEWER_WIDTH, height: VIEWER_HEIGHT }}>
                        <FileViewer
                            fileName={fileName}
                            url={downloadUrl}
                            view="compact"
                            width={VIEWER_WIDTH}
                            height={VIEWER_HEIGHT}
                            imageControlEnabled={true}
                            footer={renderFileViewerFooter}
                        />
                    </div>
                    <div className={styles.footer}>
                        <ArrowPagination {...paginationProps} />
                    </div>
                    <InnerWidget
                        widgetName={internalWidget?.name}
                        spinning={isLoading}
                        afterWidget={
                            internalWidget && internalWidgetOperations?.length ? (
                                <Operations
                                    operations={internalWidgetOperations}
                                    bcName={internalWidget?.bcName}
                                    widgetMeta={internalWidget}
                                />
                            ) : null
                        }
                    />
                </Popup>
            )}
        </>
    )
}

export default React.memo(FileViewerContainer)
