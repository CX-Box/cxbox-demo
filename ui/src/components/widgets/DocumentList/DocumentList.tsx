import React, { useEffect, useState } from 'react'
import cn from 'classnames'
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

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface DocumentListProps {
    meta: AppWidgetMeta
}

const emptyData: DataItem[] = []
const defaultImageSize = 200

function DocumentList({ meta }: DocumentListProps) {
    const { t } = useTranslation()
    const { bcName } = meta
    const data = useAppSelector(state => state.data[bcName] ?? emptyData)
    const { getUrl, getTitle, isImageFile, imageSizeOnList, popupWidget, isPdfFile } = useDocumentPreviewOption(meta)

    const dispatch = useDispatch()

    const createClickHandler = (id: string) => () => {
        if (popupWidget) {
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
        } else {
            console.error(
                'Option "documentPreview.popupWidgetName" is missing in the meta for the widget, or corresponding popup widget is missing.'
            )
        }
    }

    const [numPages, setNumPages] = useState<number>()

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages)
    }

    return (
        <div className={cn(styles.root)}>
            <div className={cn(styles.previewGroup)}>
                {data.length > 0 ? (
                    data.map((item: Record<string, any>, index) => {
                        let content: JSX.Element
                        const url = getUrl(item)

                        if (isImageFile(item)) {
                            content = (
                                <Image
                                    preview={false}
                                    src={url}
                                    width={imageSizeOnList}
                                    height={imageSizeOnList}
                                    onClick={createClickHandler(item.id)}
                                />
                            )
                        } else if (isPdfFile(item)) {
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
                                    onClick={createClickHandler(item.id)}
                                >
                                    <Icon type={getFileIconFromUrl(url)} />
                                </span>
                            )
                        }

                        return (
                            <div className={styles.card} key={item.id ?? index} style={{ width: imageSizeOnList }}>
                                {content}
                                {getTitle(item)}
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

    const getUrl = (dataItem: Record<string, string>) => {
        if (!isValidMetaOption) {
            return
        }

        if (type === 'base64') {
            const { fieldKeyForBase64, fieldKeyForContentType } = documentPreview as DocumentPreviewBase64Option

            return createDataUrl(dataItem[fieldKeyForContentType], dataItem[fieldKeyForBase64]) as string
        } else if (type === 'fileUrl' || type === 'dataUrl' || type === 'generatedFileUrl') {
            const { fieldKeyForUrl } = documentPreview as DocumentPreviewDataUrlOption | DocumentPreviewFileUrlOption

            return dataItem[fieldKeyForUrl]
        }
    }

    const getTitle = (dataItem: Record<string, string>) => {
        return documentPreview?.fieldKeyForImageTitle ? dataItem[documentPreview?.fieldKeyForImageTitle] : null
    }

    const isImageFile = (dataItem: Record<string, string>) => {
        if (type === 'base64' || type === 'generatedFileUrl') {
            const { fieldKeyForContentType } = documentPreview as DocumentPreviewBase64Option

            return isImageFileType(dataItem[fieldKeyForContentType])
        } else if (type === 'fileUrl' || type === 'dataUrl') {
            const { fieldKeyForUrl } = documentPreview as DocumentPreviewDataUrlOption | DocumentPreviewFileUrlOption

            return isImageUrl(dataItem[fieldKeyForUrl])
        }

        return false
    }

    const isPdfFile = (dataItem: Record<string, string>) => {
        if (type === 'base64' || type === 'generatedFileUrl') {
            const { fieldKeyForContentType } = documentPreview as DocumentPreviewBase64Option

            return isPdfType(dataItem[fieldKeyForContentType])
        } else if (type === 'fileUrl' || type === 'dataUrl') {
            const { fieldKeyForUrl } = documentPreview as DocumentPreviewDataUrlOption | DocumentPreviewFileUrlOption

            return isPdfUrl(dataItem[fieldKeyForUrl])
        }

        return false
    }

    return {
        getTitle,
        getUrl,
        imageSizeOnList: documentPreview?.imageSizeOnList ?? defaultImageSize,
        popupWidget,
        isPdfFile,
        isImageFile
    }
}
