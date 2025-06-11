import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cn from 'classnames'
import styles from './CardCarouselList.less'
import { CardCarouselListWidgetMeta, FileUploadFieldMeta, WidgetField } from '@interfaces/widget'
import { Empty } from 'antd'
import { DataItem, FieldType } from '@cxbox-ui/schema'
import { useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'
import { PREVIEW_WIDTH_DEFAULT, TEMP_DEFAULT_ROW_SIZE } from '@constants/fileViewer'
import ArrowPagination from '@components/ui/ArrowPagination/ArrowPagination'
import { useArrowPagination } from '@components/ui/ArrowPagination/ArrowPagination.hooks'
import { useIsActiveRecord } from '@hooks/useIsActiveRecord'
import { HorizontalScrollOptions, useInnerHorizontalScroll } from '@hooks/useInnerHorizontalScroll'
import { selectBcData } from '@selectors/selectors'
import ResizeObserver, { SizeInfo } from 'rc-resize-observer'
import debounce from 'lodash.debounce'
import FileUploadFieldWithOperations from '@components/widgets/CardCarouselList/FileUploadFieldWithOperations'
import InnerWidget from '@components/InnerWidget/InnerWidget'
import { ImageControlEnabledContext, PreviewPaginationEnabledContext } from '@fields/FileUpload/context'
import { usePrevious } from '@hooks/usePrevious'
import Field from '@components/Field/Field'
import { DictionaryFieldMeta } from '@cxbox-ui/core'
import HorizontalScrollContainer from '@components/widgets/CardCarouselList/HorizontalScrollContainer'
import Pagination from '@components/ui/Pagination/Pagination'

interface CardCarouselListProps {
    meta: CardCarouselListWidgetMeta
    type?: 'carousel' | 'list'
}

const ITEM_GAP = 10

function CardCarouselList({ meta, type = 'carousel' }: CardCarouselListProps) {
    const isCarousel = type === 'carousel'
    const { t } = useTranslation()
    const { bcName, name: widgetName } = meta
    const cardOptions = meta.options?.card
    const data = useAppSelector(state => selectBcData(state, bcName))
    const widgetField = (meta?.fields as FileUploadFieldMeta[])?.find(field =>
        cardOptions?.valueFieldKey ? cardOptions?.valueFieldKey === field.key : field.type === FieldType.fileUpload
    )
    const statusField = (meta?.fields as DictionaryFieldMeta[])?.find(field => field.type === FieldType.dictionary)
    const paginationProps = useArrowPagination(meta)
    const isActiveItem = useIsActiveRecord(bcName)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const { scrollToElement } = useInnerHorizontalScroll(containerRef, { type: 'left', gap: ITEM_GAP })
    const totalCount = data?.length ?? 0

    const [offsetOfPreviewPagination, setOffsetOfPreviewPagination] = useState(0)

    const handleChangePagination = useCallback(
        (currentIndex: number) => {
            let newIndex = currentIndex

            if (newIndex >= totalCount) {
                newIndex = 0
            } else if (newIndex < 0) {
                newIndex = totalCount - 1
            }

            paginationProps.onChange(newIndex)
        },
        [paginationProps, totalCount]
    )

    const handlePreviewPaginationChange = useCallback(
        (currentIndex: number, oldIndex: number) => {
            const currentSpaceNumber = Math.floor(oldIndex / offsetOfPreviewPagination)
            const newSpaceNumber = currentSpaceNumber + (currentIndex > oldIndex ? 1 : -1)
            let newIndex = newSpaceNumber * offsetOfPreviewPagination

            if (newIndex >= totalCount) {
                newIndex = 0
            } else if (newIndex < 0) {
                newIndex = totalCount - (totalCount % offsetOfPreviewPagination)
            }

            handleChangePagination(newIndex)
        },
        [handleChangePagination, offsetOfPreviewPagination, totalCount]
    )

    const normalizedWidth = widgetField?.width ?? PREVIEW_WIDTH_DEFAULT
    const normalizedHeight = widgetField?.minRows ? widgetField.minRows * TEMP_DEFAULT_ROW_SIZE : normalizedWidth

    const handlePreviewGroupResize = useMemo(
        () =>
            debounce((size: SizeInfo) => {
                setOffsetOfPreviewPagination(Math.round(size.width / (normalizedWidth + ITEM_GAP)))
            }, 200),
        [normalizedWidth]
    )

    useEffect(() => {
        return () => {
            handlePreviewGroupResize.cancel()
        }
    }, [handlePreviewGroupResize])

    const currentCursor = useAppSelector(state => state.screen.bo.bc[bcName]?.cursor)
    const previousCursor = usePrevious(currentCursor)
    const scrollTypeRef = useRef<HorizontalScrollOptions['type']>('left')

    useEffect(() => {
        if (currentCursor !== previousCursor) {
            const newIndex = data?.findIndex(item => item.id === currentCursor) ?? -1
            newIndex > -1 && scrollToElement(newIndex, { type: scrollTypeRef.current, gap: ITEM_GAP })
            scrollTypeRef.current = 'left'
        }
    }, [bcName, currentCursor, data, previousCursor, scrollToElement])

    const mainFileElement =
        data?.length && meta.options?.read?.widget ? (
            <div className={cn(styles.main)}>
                <PreviewPaginationEnabledContext.Provider value={true}>
                    <ImageControlEnabledContext.Provider value={true}>
                        <InnerWidget widgetName={meta.options?.read?.widget} />
                    </ImageControlEnabledContext.Provider>
                </PreviewPaginationEnabledContext.Provider>
            </div>
        ) : null

    const hideCarouselPagination = !isCarousel || !totalCount || totalCount <= offsetOfPreviewPagination

    const previewListElement = (
        <ArrowPagination
            mode="carouselList"
            {...paginationProps}
            hide={hideCarouselPagination}
            disabledLeft={hideCarouselPagination}
            disabledRight={hideCarouselPagination}
            onChange={handlePreviewPaginationChange}
        >
            <ResizeObserver onResize={handlePreviewGroupResize}>
                <HorizontalScrollContainer
                    ref={containerRef}
                    className={cn(styles.previewGroup, { [styles[type]]: !!type })}
                    style={{ gap: ITEM_GAP }}
                    disabled={!isCarousel}
                >
                    {data?.length ? (
                        data?.map((dataItem, index) => {
                            const size = widgetField?.width ?? PREVIEW_WIDTH_DEFAULT

                            return widgetField ? (
                                <div
                                    key={dataItem.id}
                                    className={cn(styles.card, { [styles.active]: isActiveItem(dataItem.id) })}
                                    onClick={() => {
                                        scrollTypeRef.current = 'center'
                                        paginationProps.onChange(index)
                                    }}
                                >
                                    <div className={styles.previewItemWrapper}>
                                        <FileUploadFieldWithOperations
                                            data-anchor={true}
                                            data-index={index}
                                            data-carousel-item={true}
                                            id={dataItem.id}
                                            widgetName={widgetName}
                                            bcName={bcName}
                                            widgetField={widgetField}
                                            width={normalizedWidth}
                                            height={normalizedHeight}
                                            onFileClick={null}
                                        >
                                            {statusField && (
                                                <div className={styles.status}>
                                                    <Field
                                                        data={dataItem as DataItem}
                                                        bcName={bcName}
                                                        cursor={dataItem.id}
                                                        widgetName={widgetName}
                                                        widgetFieldMeta={statusField as WidgetField}
                                                        readonly={true}
                                                    />
                                                </div>
                                            )}
                                        </FileUploadFieldWithOperations>
                                    </div>
                                    <div style={{ width: size, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {dataItem[cardOptions?.titleFieldKey ?? widgetField.key]}
                                    </div>
                                </div>
                            ) : null
                        })
                    ) : (
                        <div className={styles.empty}>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('No data')} />
                        </div>
                    )}
                </HorizontalScrollContainer>
            </ResizeObserver>
        </ArrowPagination>
    )

    return (
        <div className={cn(styles.root)}>
            {mainFileElement}
            {previewListElement}
            {!isCarousel && <Pagination meta={meta} />}
        </div>
    )
}

export default React.memo(CardCarouselList)
