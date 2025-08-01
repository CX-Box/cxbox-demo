import React, { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Popup from '@components/ui/Popup/Popup'
import FileViewer from '@components/FileViewer/FileViewer'
import ArrowPagination from '@components/ui/ArrowPagination/ArrowPagination'
import Header from './Header'
import PopupContent from './PopupContent'
import PopupFooter from './PopupFooter'
import FullscreenFileViewer from './FullscreenFileViewer'
import { useAppSelector } from '@store'
import { useArrowPagination } from '@components/ui/ArrowPagination/ArrowPagination.hooks'
import { useWindowSize } from '@hooks/useWindowSize'
import { useVisibility } from '@components/widgets/Table/hooks/useVisibility'
import { applyParams, getFileUploadEndpoint } from '@utils/api'
import { trimString } from '@utils/fileViewer'
import { actions } from '@cxbox-ui/core'
import { WidgetField } from '@cxbox-ui/schema'
import { FileViewerPopupOptions, PopupData } from '@interfaces/view'
import { FileUploadFieldMeta } from '@interfaces/widget'
import styles from './FileViewerContainer.less'

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

    const popupData = useAppSelector(state => state.view.popupData) as PopupData
    const { active, calleeWidgetName, options } = popupData
    const { type, calleeFieldKey } = (options as FileViewerPopupOptions) ?? {}
    const visible = isInline || active
    const fileFieldKey = fieldKey || calleeFieldKey
    const widget = useAppSelector(state => state.view.widgets?.find(item => item.name === (widgetName || calleeWidgetName)))
    const widgetField = (widget?.fields as WidgetField[])?.find(field => field.key === fileFieldKey) as FileUploadFieldMeta | undefined
    const { fileSource, fileIdKey = '', preview } = widgetField ?? {}
    const cursor = useAppSelector(state => {
        return state.screen.bo.bc[widget?.bcName as string]?.cursor
    })
    const pendingData = useAppSelector(
        state => (widget?.bcName && cursor && state.view.pendingDataChanges[widget?.bcName]?.[cursor]) || undefined
    )
    const fileNameDelta = pendingData?.[fileFieldKey] as string | undefined
    const fileIdDelta = pendingData?.[fileIdKey] as string | undefined
    const record = useAppSelector(state => state.data[widget?.bcName as string])?.find(item => item.id === cursor) as
        | Record<string, string>
        | undefined
    const fileName = (fileNameDelta || record?.[fileFieldKey]) ?? ''

    const paginationProps = useArrowPagination(widget)

    const windowSize = useWindowSize()

    const { visibility: fullscreen, changeVisibility: setFullscreen } = useVisibility(false)

    useEffect(() => {
        if (visible) {
            setFullscreen(false)
        }
    }, [setFullscreen, visible])

    const getDownloadUrl = (params: { id?: string; source?: string }) => {
        return params?.id ? applyParams(getFileUploadEndpoint(), params) : undefined
    }

    const downloadUrl = getDownloadUrl({
        source: fileSource,
        id: fileIdDelta || ((fileIdKey && record?.[fileIdKey as string]?.toString()) as string)
    })

    const handleCancel = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName: widget?.bcName }))
    }, [dispatch, widget?.bcName])

    if (!isInline && (type !== 'file-viewer' || !visible)) {
        return null
    }

    const handleDownload = () => {
        if (downloadUrl) {
            dispatch(
                actions.downloadFileByUrl({
                    url: downloadUrl,
                    name: fileName
                })
            )
        }
    }

    return (
        <>
            <FullscreenFileViewer
                title={
                    <Header
                        className={styles.fullscreenHeader}
                        theme="dark"
                        title={preview?.titleKey ? record?.[preview?.titleKey] : trimString(fileName)}
                        center={
                            <div className={styles.headerCenter}>
                                {t('number of total files', {
                                    number: paginationProps.currentIndex + 1,
                                    total: paginationProps.total
                                })}
                            </div>
                        }
                        hint={preview?.hintKey ? record?.[preview?.hintKey] : undefined}
                        onClose={() => setFullscreen(false)}
                        onDownload={handleDownload}
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
                        />
                    </ArrowPagination>
                }
                visible={visible && fullscreen}
            />

            {isInline ? (
                <>
                    <Header
                        className={styles.headerInline}
                        theme="light"
                        title={preview?.titleKey ? record?.[preview?.titleKey] : trimString(fileName)}
                        hint={preview?.hintKey ? record?.[preview?.hintKey] : undefined}
                        onDownload={handleDownload}
                        onFullscreen={() => setFullscreen(true)}
                    />

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
                            className={styles.popupHeader}
                            theme="light"
                            title={preview?.titleKey ? record?.[preview?.titleKey] : trimString(fileName)}
                            hint={preview?.hintKey ? record?.[preview?.hintKey] : undefined}
                            onClose={handleCancel}
                            onDownload={handleDownload}
                            onFullscreen={() => setFullscreen(true)}
                        />
                    }
                    footer={
                        <PopupFooter>
                            <ArrowPagination {...paginationProps} />
                        </PopupFooter>
                    }
                    onCancel={handleCancel}
                    width={POPUP_WIDTH}
                    className={styles.popup}
                >
                    <PopupContent>
                        <FileViewer fileName={fileName} url={downloadUrl} view="compact" width={VIEWER_WIDTH} height={VIEWER_HEIGHT} />
                    </PopupContent>
                </Popup>
            )}
        </>
    )
}

export default React.memo(FileViewerContainer)
