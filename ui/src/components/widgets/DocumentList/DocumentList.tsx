import React, { useEffect, useState } from 'react'
import cn from 'classnames'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import styles from './DocumentList.less'
import Pagination from '../../ui/Pagination/Pagination'
import Image from 'rc-image'
import { useDispatch } from 'react-redux'
import 'rc-image/assets/index.css'
import { actions } from '@actions'
import { AppWidgetMeta, DocumentPreviewBase64Option, DocumentPreviewDataUrlOption, DocumentPreviewFileUrlOption } from '@interfaces/widget'
import { createDataUrl, getFileIconFromUrl, isImageFileType, isImageUrl, isPdfType, isPdfUrl } from '@utils/documentPreview'
import { Empty, Icon } from 'antd'
import { DataItem } from '@cxbox-ui/schema'
import { useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'
import { Document, Page, pdfjs } from 'react-pdf'
// @ts-ignore
import worker from 'pdfjs-dist/webpack'

pdfjs.GlobalWorkerOptions.workerSrc = worker

interface DocumentListProps {
    meta: AppWidgetMeta
}

const emptyData: DataItem[] = []
const defaultImageSize = 200

function DocumentList({ meta }: DocumentListProps) {
    const { t } = useTranslation()
    const { bcName } = meta
    const data = useAppSelector(state => state.data[bcName] ?? emptyData) as Record<string, string | null>[]
    const { getUrl, getTitle, showImageViewer, imageSizeOnList, popupWidget, showPdfViewer } = useDocumentPreviewOption(meta)

    const dispatch = useDispatch()

    const createClickHandler = (id: string | null) => () => {
        if (popupWidget && id) {
            dispatch(
                actions.bcSelectRecord({
                    bcName: popupWidget.bcName,
                    cursor: id
                })
            )
            dispatch(
                actions.showViewPopup({
                    calleeBCName: popupWidget.bcName,
                    widgetName: popupWidget.name,
                    bcName: popupWidget.bcName
                })
            )
        } else if (!popupWidget) {
            console.error(
                'Option "documentPreview.popupWidgetName" is missing in the meta for the widget, or corresponding popup widget is missing.'
            )
        }
    }

    return (
        <div className={cn(styles.root)}>
            <div className={cn(styles.previewGroup)}>
                {data.length > 0 ? (
                    data.map((item, index) => {
                        let content: JSX.Element
                        const url = getUrl(item)

                        if (showImageViewer(item)) {
                            content = (
                                <Image
                                    preview={false}
                                    src={url}
                                    width={imageSizeOnList}
                                    height={imageSizeOnList}
                                    onClick={createClickHandler(item.id)}
                                />
                            )
                        } else if (showPdfViewer(item)) {
                            content = (
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        height: imageSizeOnList,
                                        width: imageSizeOnList,
                                        overflow: 'hidden'
                                    }}
                                    className={styles.fileWrapper}
                                    onClick={createClickHandler(item.id)}
                                >
                                    <Document file={url}>
                                        <Page height={imageSizeOnList} pageNumber={1} />
                                    </Document>
                                </span>
                            )
                        } else {
                            content = (
                                <span
                                    style={{
                                        height: imageSizeOnList,
                                        width: imageSizeOnList
                                    }}
                                    className={styles.fileWrapper}
                                    onClick={createClickHandler(item?.id)}
                                >
                                    <Icon type={getFileIconFromUrl(url)} />
                                </span>
                            )
                        }

                        return (
                            <div className={styles.card} key={item?.id ?? index} style={{ width: imageSizeOnList }}>
                                {content}
                                {item ? getTitle(item) : ''}
                            </div>
                        )
                    })
                ) : (
                    <div className={styles.empty}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('No data')} />
                    </div>
                )}
            </div>
            <Pagination meta={meta} />
        </div>
    )
}

export default React.memo(DocumentList)

function useDocumentPreviewOption(meta: AppWidgetMeta) {
    const { options } = meta
    const documentPreview = options?.documentPreview
    const [isValidMetaOption, setIsValidOption] = useState<boolean>(false)
    const popupWidget = useAppSelector(state => {
        return state.view.widgets.find(widget => widget.name === documentPreview?.edit?.widget)
    })

    useEffect(() => {
        if (!documentPreview) {
            console.error('Option "documentPreview" is missing in the meta for the widget')
        } else if (!documentPreview.type) {
            console.error('Option "documentPreview.type" is missing in the meta for the widget')
        } else if (documentPreview.type === 'base64' && (!documentPreview?.fieldKeyForBase64 || !documentPreview?.fieldKeyForContentType)) {
            console.error(
                'Options "documentPreview.fieldKeyForBase64" or "documentPreview.fieldKeyForContentType" are missing in the meta for the widget'
            )
        } else if (
            documentPreview.type === 'generatedFileUrl' &&
            (!documentPreview?.fieldKeyForUrl || !documentPreview?.fieldKeyForContentType)
        ) {
            console.error(
                'Options "documentPreview.fieldKeyForUrl" or "documentPreview.fieldKeyForContentType" are missing in the meta for the widget'
            )
        } else if ((documentPreview.type === 'fileUrl' || documentPreview.type === 'dataUrl') && !documentPreview.fieldKeyForUrl) {
            console.error('Option "documentPreview.fieldKeyForUrl" is missing in the meta for the widget')
        } else {
            setIsValidOption(true)
        }
    }, [documentPreview])

    const type = options?.documentPreview?.type

    const getUrl = (dataItem: Record<string, string | null>) => {
        if (!isValidMetaOption) {
            return
        }

        if (type === 'base64') {
            const { fieldKeyForBase64, fieldKeyForContentType } = documentPreview as DocumentPreviewBase64Option

            return createDataUrl(dataItem[fieldKeyForContentType], dataItem[fieldKeyForBase64])
        } else if (type === 'fileUrl' || type === 'dataUrl' || type === 'generatedFileUrl') {
            const { fieldKeyForUrl } = documentPreview as DocumentPreviewDataUrlOption | DocumentPreviewFileUrlOption

            return dataItem[fieldKeyForUrl] as string
        }
    }

    const getTitle = (dataItem: Record<string, string | null>) => {
        return documentPreview?.fieldKeyForImageTitle ? dataItem[documentPreview?.fieldKeyForImageTitle] : null
    }

    const isImageFile = (dataItem: Record<string, string | null>) => {
        if (type === 'base64' || type === 'generatedFileUrl') {
            const { fieldKeyForContentType } = documentPreview as DocumentPreviewBase64Option

            return isImageFileType(dataItem[fieldKeyForContentType] ?? '')
        } else if (type === 'fileUrl' || type === 'dataUrl') {
            const { fieldKeyForUrl } = documentPreview as DocumentPreviewDataUrlOption | DocumentPreviewFileUrlOption

            return isImageUrl(dataItem[fieldKeyForUrl] ?? '')
        }

        return false
    }

    const isPdfFile = (dataItem: Record<string, string | null>) => {
        if (type === 'base64' || type === 'generatedFileUrl') {
            const { fieldKeyForContentType } = documentPreview as DocumentPreviewBase64Option

            return isPdfType(dataItem[fieldKeyForContentType] ?? '')
        } else if (type === 'fileUrl' || type === 'dataUrl') {
            const { fieldKeyForUrl } = documentPreview as DocumentPreviewDataUrlOption | DocumentPreviewFileUrlOption

            return isPdfUrl(dataItem[fieldKeyForUrl] ?? '')
        }

        return false
    }

    const showPdfViewer = (dataItem: Record<string, string | null>) => {
        return documentPreview?.enabledPdfViewer && isPdfFile(dataItem)
    }

    return {
        getTitle,
        getUrl,
        imageSizeOnList: documentPreview?.imageSizeOnList ?? defaultImageSize,
        popupWidget,
        showPdfViewer,
        showImageViewer: isImageFile
    }
}
