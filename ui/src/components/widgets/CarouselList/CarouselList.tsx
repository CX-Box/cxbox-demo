import React, { useCallback, useMemo, useRef, useState } from 'react'
import cn from 'classnames'
import styles from './CarouselList.less'
import { AppWidgetMeta, FileUploadFieldMeta } from '@interfaces/widget'
import { Empty } from 'antd'
import { DataItem, FieldType } from '@cxbox-ui/schema'
import { useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'
import Field from '@components/Field/Field'
import { MAIN_SIZE_MULTIPLIER, PREVIEW_WIDTH_DEFAULT } from '@constants/fileViewer'
import ArrowPagination from '@components/ui/ArrowPagination/ArrowPagination'
import { useArrowPagination } from '@components/ui/ArrowPagination/ArrowPagination.hooks'
import { useIsActiveRecord } from '@hooks/useIsActiveRecord'
import { useInnerHorizontalScroll } from '@hooks/useInnerHorizontalScroll'
import { selectBcData } from '@selectors/selectors'
import ResizeObserver, { SizeInfo } from 'rc-resize-observer'
import debounce from 'lodash.debounce'
import FileUploadField from '@components/widgets/CarouselList/FileUploadField'
import { useHorizontalMouseWheelScroll } from '@hooks/useHorizontalMouseWheelScroll'

interface CarouselListProps {
    meta: AppWidgetMeta
}

const ITEM_GAP = 10

function CarouselList({ meta }: CarouselListProps) {
    const { t } = useTranslation()
    const { bcName, name: widgetName } = meta
    const data = useAppSelector(state => selectBcData(state, bcName))
    const widgetField = (meta?.fields as FileUploadFieldMeta[])?.find(field => field.type === FieldType.fileUpload)
    const paginationProps = useArrowPagination(meta)
    const isActiveItem = useIsActiveRecord(bcName)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const { scrollToElement } = useInnerHorizontalScroll(containerRef, { type: 'left', gap: ITEM_GAP })
    useHorizontalMouseWheelScroll(containerRef)
    const totalCount = data?.length ?? 0
    const activeRecord = data?.find(item => isActiveItem(item.id))

    const [offsetOfPreviewPagination, setOffsetOfPreviewPagination] = useState(0)

    const handleChangePagination = useCallback(
        (index: number) => {
            let newIndex = index

            if (newIndex >= totalCount) {
                newIndex = 0
            } else if (newIndex < 0) {
                newIndex = totalCount - (totalCount % offsetOfPreviewPagination)
            }

            paginationProps.onChange(newIndex)
            scrollToElement(newIndex)
        },
        [offsetOfPreviewPagination, paginationProps, scrollToElement, totalCount]
    )

    const handlePreviewPaginationChange = useCallback(
        (currentIndex: number, oldIndex: number) => {
            const currentSpaceNumber = Math.floor(oldIndex / offsetOfPreviewPagination)
            const newSpaceNumber = currentSpaceNumber + (currentIndex > oldIndex ? 1 : -1)

            handleChangePagination(newSpaceNumber * offsetOfPreviewPagination)
        },
        [handleChangePagination, offsetOfPreviewPagination]
    )

    const normalizedWidth = widgetField?.width ?? PREVIEW_WIDTH_DEFAULT
    const normalizedHeight = widgetField?.height ?? normalizedWidth

    const handlePreviewGroupResize = useMemo(
        () =>
            debounce((size: SizeInfo) => {
                setOffsetOfPreviewPagination(Math.round(size.width / (normalizedWidth + ITEM_GAP)))
            }, 200),
        [normalizedWidth]
    )

    return (
        <div className={cn(styles.root)}>
            <div className={cn(styles.main)}>
                <ArrowPagination
                    mode="wrapper"
                    {...paginationProps}
                    onChange={handleChangePagination}
                    disabledLeft={!totalCount}
                    disabledRight={!totalCount}
                >
                    {widgetField ? (
                        <FileUploadField
                            id={activeRecord?.id as string}
                            widgetName={widgetName}
                            bcName={bcName}
                            widgetField={widgetField}
                            width={normalizedWidth * MAIN_SIZE_MULTIPLIER}
                            height={normalizedHeight * MAIN_SIZE_MULTIPLIER}
                        />
                    ) : null}
                </ArrowPagination>
            </div>
            <ArrowPagination
                mode="wrapper"
                {...paginationProps}
                disabledLeft={!totalCount}
                disabledRight={!totalCount}
                onChange={handlePreviewPaginationChange}
            >
                <ResizeObserver onResize={handlePreviewGroupResize}>
                    <div ref={containerRef} className={cn(styles.previewGroup)} style={{ gap: ITEM_GAP }}>
                        {data?.length ? (
                            data?.map((dataItem, index) => {
                                const size = widgetField?.width ?? PREVIEW_WIDTH_DEFAULT

                                return widgetField ? (
                                    <div key={dataItem.id} className={cn(styles.card, { [styles.active]: isActiveItem(dataItem.id) })}>
                                        <div data-anchor={true} data-index={index} data-carousel-item={true}>
                                            <Field
                                                data={dataItem as DataItem}
                                                bcName={bcName}
                                                cursor={dataItem.id}
                                                widgetName={widgetName}
                                                widgetFieldMeta={widgetField}
                                                readonly={true}
                                            />
                                        </div>
                                        <div style={{ width: size, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                            {dataItem[widgetField.key]}
                                        </div>
                                    </div>
                                ) : null
                            })
                        ) : (
                            <div className={styles.empty}>
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('No data')} />
                            </div>
                        )}
                    </div>
                </ResizeObserver>
            </ArrowPagination>
        </div>
    )
}

export default React.memo(CarouselList)
