import React, { useCallback, useEffect } from 'react'
import Popup from '@components/ui/Popup/Popup'
import Header from '@components/FileViewerPopup/Header'
import FileViewer, { FileViewerProps } from '@components/FileViewer/FileViewer'
import styles from './FileViewerPopup.less'
import ArrowPagination from '@components/ui/ArrowPagination/ArrowPagination'
import { useAppSelector } from '@store'
import { actions } from '@cxbox-ui/core'
import { useArrowPagination } from '@components/ui/ArrowPagination/ArrowPagination.hooks'
import { useDispatch } from 'react-redux'
import { FileViewerPopupOptions, PopupData } from '@interfaces/view'
import { WidgetField } from '@cxbox-ui/schema'
import { applyParams, getFileUploadEndpoint } from '@utils/api'
import FullscreenFileViewer from '@components/FileViewerPopup/FullscreenFileViewer'
import { useWindowSize } from '@hooks/useWindowSize'
import { useVisibility } from '@components/widgets/Table/hooks/useVisibility'
import { trimString } from '@utils/fileViewer'
import { AppWidgetMeta, FileUploadFieldMeta } from '@interfaces/widget'
import { useTranslation } from 'react-i18next'
import { CxBoxApiInstance } from '../../api'
import { useInternalForm } from '@components/FileViewerPopup/hooks/useInternalForm'
import ImageControlButtons from '@components/FileViewer/ImageControlButtons/ImageControlButtons'

const POPUP_WIDTH = 808
const VIEWER_WIDTH = 760
const VIEWER_HEIGHT = 760

function FileViewerPopup() {
    const { t } = useTranslation()
    const popupData = useAppSelector(state => state.view.popupData) as PopupData
    const { active: visible, calleeWidgetName, options } = popupData
    const { type, calleeFieldKey, mode } = (options as FileViewerPopupOptions) ?? {}
    const widget = useAppSelector(state => state.view.widgets?.find(item => item.name === calleeWidgetName))
    const widgetField = (widget?.fields as WidgetField[])?.find(field => field.key === calleeFieldKey) as FileUploadFieldMeta | undefined
    const { fileSource, fileIdKey = '', preview } = widgetField ?? {}
    const cursor = useAppSelector(state => {
        return state.screen.bo.bc[widget?.bcName as string]?.cursor
    })
    const pendingData = useAppSelector(
        state => (widget?.bcName && cursor && state.view.pendingDataChanges[widget?.bcName]?.[cursor]) || undefined
    )
    const fileNameDelta = pendingData?.[calleeFieldKey] as string | undefined
    const fileIdDelta = pendingData?.[fileIdKey] as string | undefined
    const record = useAppSelector(state => state.data[widget?.bcName as string])?.find(item => item.id === cursor) as
        | Record<string, string>
        | undefined
    const fileName = (fileNameDelta || record?.[calleeFieldKey]) ?? ''

    const paginationProps = useArrowPagination(widget)

    const windowSize = useWindowSize()

    const { visibility: fullscreen, changeVisibility: setFullscreen } = useVisibility(false)

    const { formElement } = useInternalForm(widget as AppWidgetMeta)

    useEffect(() => {
        if (visible) {
            setFullscreen(mode === 'onlyFullscreen')
        }
    }, [mode, setFullscreen, visible])

    const dispatch = useDispatch()

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

    if (type !== 'file-viewer' || !visible) {
        return null
    }

    const handleDownload = () => {
        downloadUrl && CxBoxApiInstance.saveBlob(downloadUrl, fileName)
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
                        onClose={mode === 'onlyFullscreen' ? handleCancel : () => setFullscreen(false)}
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
                            imageControlEnabled={true}
                            footer={({ displayType, imageControl }) =>
                                displayType === 'image' && imageControl ? (
                                    <ImageControlButtons
                                        imageControl={imageControl}
                                        fullScreen={true}
                                        onChangeFullScreen={() => (mode === 'onlyFullscreen' ? handleCancel() : setFullscreen(false))}
                                    />
                                ) : null
                            }
                        />
                    </ArrowPagination>
                }
                visible={visible && fullscreen}
            />
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
                        footer={({ displayType, imageControl }) =>
                            displayType === 'image' && imageControl ? (
                                <ImageControlButtons
                                    imageControl={imageControl}
                                    fullScreen={false}
                                    onChangeFullScreen={() => setFullscreen(true)}
                                />
                            ) : null
                        }
                    />
                </div>
                <div className={styles.footer}>
                    <ArrowPagination {...paginationProps} />
                </div>
                {formElement}
            </Popup>
        </>
    )
}

export default React.memo(FileViewerPopup)
