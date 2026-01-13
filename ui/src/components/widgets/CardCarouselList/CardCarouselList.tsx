import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cn from 'classnames'
import styles from './CardCarouselList.less'
import { AppWidgetMeta, CardCarouselListWidgetMeta, FileUploadFieldMeta } from '@interfaces/widget'
import { Empty, Icon } from 'antd'
import { FieldType } from '@cxbox-ui/schema'
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
import FilePreviewCard from '@components/widgets/CardCarouselList/components/FilePreviewCard'
import { usePrevious } from '@hooks/usePrevious'
import { actions, DictionaryFieldMeta } from '@cxbox-ui/core'
import HorizontalScrollContainer from '@components/widgets/CardCarouselList/components/HorizontalScrollContainer'
import Pagination from '@components/ui/Pagination/Pagination'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import InnerReadWidget from '@components/widgets/CardCarouselList/components/InnerReadWidget'
import DrillDown from '@components/ui/DrillDown/DrillDown'
import { useDispatch } from 'react-redux'

interface CardCarouselListProps {
    meta: CardCarouselListWidgetMeta
    type?: 'carousel' | 'list'
}

const ITEM_GAP = 10
const PREVIEW_STATUS_OPACITY = 0.8
const RESIZE_DEBOUNCE_MS = 200

function CardCarouselList({ meta, type = 'carousel' }: CardCarouselListProps) {
    const isCarousel = type === 'carousel'
    const { t } = useTranslation()
    const { bcName, name: widgetName } = meta
    const cardOptions = meta.options?.card

    const data = useAppSelector(state => selectBcData(state, bcName))
    const totalCount = data?.length ?? 0

    const widgetField = useMemo(() => {
        const fields = meta?.fields as FileUploadFieldMeta[] | undefined
        return fields?.find(field =>
            cardOptions?.valueFieldKey ? cardOptions.valueFieldKey === field.key : field.type === FieldType.fileUpload
        )
    }, [cardOptions?.valueFieldKey, meta?.fields])

    const statusField = useMemo(() => {
        const fields = meta?.fields as DictionaryFieldMeta[] | undefined
        return fields?.find(field => field.type === FieldType.dictionary)
    }, [meta?.fields])

    const paginationProps = useArrowPagination(meta)
    const isActiveItem = useIsActiveRecord(bcName)

    const containerRef = useRef<HTMLDivElement | null>(null)
    const { scrollToElement } = useInnerHorizontalScroll(containerRef, { type: 'left', gap: ITEM_GAP })

    const [offsetOfPreviewPagination, setOffsetOfPreviewPagination] = useState(0)

    const normalizedWidth = widgetField?.width ?? PREVIEW_WIDTH_DEFAULT
    const normalizedHeight = widgetField?.minRows ? widgetField.minRows * TEMP_DEFAULT_ROW_SIZE : normalizedWidth

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
            if (offsetOfPreviewPagination <= 0) {
                return
            }

            const currentSpaceNumber = Math.floor(oldIndex / offsetOfPreviewPagination)
            const newSpaceNumber = currentSpaceNumber + (currentIndex > oldIndex ? 1 : -1)
            let newIndex = newSpaceNumber * offsetOfPreviewPagination

            if (newIndex >= totalCount) {
                newIndex = 0
            } else if (newIndex < 0) {
                const remainder = totalCount % offsetOfPreviewPagination
                newIndex = remainder === 0 ? Math.max(totalCount - offsetOfPreviewPagination, 0) : totalCount - remainder
            }

            handleChangePagination(newIndex)
        },
        [handleChangePagination, offsetOfPreviewPagination, totalCount]
    )

    const handlePreviewGroupResize = useMemo(
        () =>
            debounce((size: SizeInfo) => {
                const itemsOnPage = Math.round(size.width / (normalizedWidth + ITEM_GAP))
                setOffsetOfPreviewPagination(itemsOnPage)
            }, RESIZE_DEBOUNCE_MS),
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
            if (newIndex > -1) {
                scrollToElement(newIndex, { type: scrollTypeRef.current, gap: ITEM_GAP })
            }
            scrollTypeRef.current = 'left'
        }
    }, [currentCursor, data, previousCursor, scrollToElement])

    const renderTitle = useCallback(
        (widget?: AppWidgetMeta, text?: string, id?: string, opacity?: number) =>
            widget ? (
                <WidgetTitle
                    level={2}
                    widgetName={widget.name}
                    text={text ?? widget?.title}
                    bcColor={widget?.options?.title?.bgColor}
                    id={id}
                    opacity={opacity}
                />
            ) : null,
        []
    )

    const mainFileElement = useMemo(() => {
        if (!data?.length || !meta.options?.read?.widget) {
            return null
        }

        return (
            <div className={cn(styles.main)}>
                <InnerReadWidget widgetName={meta.options.read.widget} />
            </div>
        )
    }, [data?.length, meta.options?.read?.widget])

    const hideCarouselPagination = !isCarousel || !totalCount || totalCount <= offsetOfPreviewPagination
    const dispatch = useDispatch()

    const drillDownEnabled = widgetField?.drillDown

    const renderCard = (dataItem: NonNullable<typeof data>[number], index: number) => {
        if (!widgetField) {
            return null
        }

        const title = dataItem[cardOptions?.titleFieldKey ?? widgetField.key]

        const handleDrilldown = drillDownEnabled
            ? (event?: React.MouseEvent) => {
                  event?.stopPropagation()
                  dispatch(actions.userDrillDown({ widgetName, cursor: dataItem.id, bcName, fieldKey: widgetField.key }))
              }
            : undefined

        return (
            <FilePreviewCard
                key={dataItem.id}
                className={cn(styles.card, { [styles.active]: isActiveItem(dataItem.id) })}
                onClick={() => {
                    scrollTypeRef.current = 'center'
                    paginationProps.onChange(index)
                }}
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
                footer={
                    <>
                        {handleDrilldown ? (
                            <DrillDown
                                meta={widgetField}
                                widgetName={widgetName}
                                cursor={dataItem.id}
                                drillDownComponent={
                                    <div className={styles.title} onClick={handleDrilldown}>
                                        <Icon className={styles.linkIcon} type="link" />
                                        {title}
                                    </div>
                                }
                                onDrillDown={handleDrilldown}
                            />
                        ) : (
                            <div className={styles.title}>{title}</div>
                        )}
                        {cardOptions?.descriptionFieldKey ? (
                            <div className={styles.description}>{dataItem[cardOptions?.descriptionFieldKey]}</div>
                        ) : null}
                    </>
                }
            >
                {statusField ? (
                    <div className={styles.status}>{renderTitle(meta, `$\{${statusField.key}\}`, dataItem.id, PREVIEW_STATUS_OPACITY)}</div>
                ) : null}
            </FilePreviewCard>
        )
    }

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
                        data.map(renderCard)
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
