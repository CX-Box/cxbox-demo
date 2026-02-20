import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import { Col, Row, Spin } from 'antd'
import { useAppSelector } from '@store'
import styles from './InnerReadWidget.module.less'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import { selectBc, selectBcData, selectBcUrlRowMeta, selectWidget } from '@selectors/selectors'
import { useWidgetVisibility } from '@hooks/useWidgetVisibility'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { AppWidgetInfoMeta, AppWidgetMeta, FileUploadFieldMeta } from '@interfaces/widget'
import { FieldType } from '@cxbox-ui/schema'
import { isDefined } from '@utils/isDefined'
import { useArrowPagination } from '@components/ui/ArrowPagination/ArrowPagination.hooks'
import debounce from 'lodash.debounce'
import { TEMP_DEFAULT_ROW_SIZE } from '@constants/fileViewer'
import ArrowPagination from '@components/ui/ArrowPagination/ArrowPagination'
import ResizeObserver, { SizeInfo } from 'rc-resize-observer'
import FilePreview from '@components/widgets/CardCarouselList/components/FilePreview'
import { useProportionalWidgetGrid } from '@hooks/widgetGrid'
import { usePreviewEnabled } from '@components/widgets/CardCarouselList/hooks/usePreviewEnabled'

interface InnerReadWidgetProps {
    widgetName: string | undefined
    hideHeader?: boolean
}
// TODO rewrite the implementation. Use InnerWidget with a replacement field
const InnerReadWidget: FunctionComponent<InnerReadWidgetProps> = ({ widgetName, hideHeader }) => {
    const widgetVisibility = useWidgetVisibility(widgetName)
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta
    const bc = useAppSelector(state => selectBc(state, widget?.bcName))
    const rowMetaExists = useAppSelector(state => !!selectBcUrlRowMeta(state, widget?.bcName))
    const dataExists = useAppSelector(state => !!selectBcData(state, widget?.bcName))
    const spinning = !!(bc?.loading && (rowMetaExists || dataExists))

    const widgetField = useMemo(() => {
        const fields = widget?.fields as FileUploadFieldMeta[] | undefined
        const cardOptions = widget.options?.card

        return fields?.find(field =>
            cardOptions?.valueFieldKey ? cardOptions.valueFieldKey === field.key : field.type === FieldType.fileUpload
        )
    }, [widget?.fields, widget.options?.card])

    const previewEnabled = usePreviewEnabled(widget, widgetField, 'internalWidget')

    const [fileSize, setFileSize] = useState<{ defaultWidth: number | undefined; defaultHeight: number | undefined }>()

    const handlePreviewImageResize = useMemo(
        () =>
            debounce((size: SizeInfo) => {
                setFileSize({ defaultWidth: size.width, defaultHeight: size.width })
            }, 200),
        []
    )

    useEffect(() => {
        return () => {
            handlePreviewImageResize.cancel()
        }
    }, [handlePreviewImageResize])

    const paginationProps = useArrowPagination(widget)
    const data = useAppSelector(state => selectBcData(state, widget.bcName))
    const totalCount = data?.length ?? 0

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

    const width = widgetField?.width ?? fileSize?.defaultWidth
    const height = widgetField?.minRows ? widgetField?.minRows * TEMP_DEFAULT_ROW_SIZE : fileSize?.defaultHeight

    const { grid, visibleFlattenWidgetFields } = useProportionalWidgetGrid(widget as AppWidgetInfoMeta)

    if (!widget) {
        return null
    }

    if (!widgetVisibility) {
        return <DebugWidgetWrapper meta={widget} />
    }

    const widgetTitle = !hideHeader ? (
        <WidgetTitle level={2} widgetName={widget.name} text={widget?.title} bcColor={widget?.options?.title?.bgColor} />
    ) : null

    return (
        <DebugWidgetWrapper meta={widget} className={styles.debug}>
            <div
                className={styles.container}
                data-test="WIDGET"
                data-test-widget-type={widget.type}
                data-test-widget-position={widget.position}
                data-test-widget-title={widget.title}
                data-test-widget-name={widget.name}
            >
                {widgetTitle}
                {previewEnabled ? (
                    <Spin spinning={spinning}>
                        <Row>
                            {grid?.map((row, index) => {
                                return (
                                    <Row key={index} gutter={24} type="flex" className={styles.nowrap}>
                                        {row.cols.map((col, colIndex) => {
                                            const field = visibleFlattenWidgetFields.find(item => item.key === col.fieldKey)

                                            if (field?.key === widgetField?.key) {
                                                return (
                                                    <Col key={colIndex} span={col.span}>
                                                        {isDefined(bc) && isDefined(widgetField) ? (
                                                            <ResizeObserver onResize={handlePreviewImageResize}>
                                                                <ArrowPagination
                                                                    mode="image"
                                                                    {...paginationProps}
                                                                    onChange={handleChangePagination}
                                                                    disabledLeft={!totalCount}
                                                                    disabledRight={!totalCount}
                                                                    hide={paginationProps.hide}
                                                                    styleWrapper={
                                                                        widgetField.width
                                                                            ? { width: '100%', maxWidth: 'min-content' }
                                                                            : undefined
                                                                    }
                                                                >
                                                                    <FilePreview
                                                                        id={bc.cursor!}
                                                                        widgetName={widget.name}
                                                                        bcName={widget.bcName}
                                                                        widgetField={widgetField}
                                                                        width={width!}
                                                                        height={height!}
                                                                        onFileClick={null}
                                                                        imageControlEnabled={true}
                                                                        previewMode="auto"
                                                                    />
                                                                </ArrowPagination>
                                                            </ResizeObserver>
                                                        ) : null}
                                                    </Col>
                                                )
                                            }

                                            return <Col key={colIndex} span={col.span} />
                                        })}
                                    </Row>
                                )
                            })}
                        </Row>
                    </Spin>
                ) : null}
            </div>
        </DebugWidgetWrapper>
    )
}

export default React.memo(InnerReadWidget)
