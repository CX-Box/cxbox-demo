import React, { useCallback, useMemo } from 'react'
import { AppWidgetMeta, FileUploadFieldMeta } from '@interfaces/widget'
import { useFileIconClick } from '@fields/FileUpload/hooks'
import FilePreview from '@components/widgets/CardCarouselList/components/FilePreview'
import PreviewCardLayout from '@components/widgets/CardCarouselList/components/PreviewCardLayout'
import { useWidgetOperations } from '@hooks/useWidgetOperations'
import { actions, Operation } from '@cxbox-ui/core'
import { useDispatch } from 'react-redux'
import { useStaleValueWhileRowMetaLoading } from '@hooks/useStaleValueWhileRowMetaLoading'
import Operations from '@components/widgets/CardCarouselList/components/Operations'
import { useCustomViewOperation, CUSTOM_VIEW_BUTTON_KEY } from '@components/widgets/CardCarouselList/hooks/useCustomViewOperation'
import { usePreviewEnabled } from '@components/widgets/CardCarouselList/hooks/usePreviewEnabled'
import { useAppSelector } from '@store'
import { selectWidget } from '@selectors/selectors'

interface FilePreviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
    id: string
    widgetName: string
    bcName: string
    widgetField: FileUploadFieldMeta
    width: number
    height: number
    onFileClick?: (() => void) | null
    imageControlEnabled?: boolean
    footer?: React.ReactNode
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
    widgetName,
    bcName,
    id,
    widgetField,
    width,
    height,
    onFileClick,
    children,
    imageControlEnabled,
    ...cardProps
}) => {
    const handleFileIconClick = useFileIconClick(widgetName, bcName, id, widgetField?.key as string)
    const widgetOperations = useWidgetOperations(widgetName, ['record'], false)
    const operations = useStaleValueWhileRowMetaLoading(widgetOperations, bcName)
    const customViewOperation = useCustomViewOperation(widgetName, widgetField.key, id)
    const customOperationsWithDefault = useMemo(() => {
        return [customViewOperation as ElementOf<typeof operations>, ...operations]
    }, [customViewOperation, operations])

    const dispatch = useDispatch()

    const getOperationProps = useCallback(
        (buttonType: string) => {
            const result: { disabled?: boolean; hidden?: boolean; onClick?: () => void; hint?: string } = {}
            const defaultOperation = operations.find(item => item.type === buttonType) as Operation | undefined

            if (defaultOperation) {
                result.onClick = () => {
                    dispatch(
                        actions.bcSelectRecord({
                            bcName: bcName,
                            cursor: id
                        })
                    )
                    dispatch(
                        actions.sendOperation({
                            bcName,
                            operationType: buttonType,
                            widgetName: widgetName,
                            bcKey: defaultOperation.bcKey,
                            confirmOperation: defaultOperation.preInvoke
                        })
                    )
                }
            }

            if (buttonType === CUSTOM_VIEW_BUTTON_KEY) {
                result.onClick = () => {
                    handleFileIconClick()
                }
            }

            return result
        },
        [bcName, dispatch, handleFileIconClick, id, operations, widgetName]
    )

    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta
    const previewEnabled = usePreviewEnabled(widget, widgetField, 'card')

    return (
        <PreviewCardLayout
            {...cardProps}
            actions={<Operations getOperationProps={getOperationProps} operations={customOperationsWithDefault} />}
        >
            {children}
            <FilePreview
                id={id}
                widgetName={widgetName}
                bcName={bcName}
                widgetField={widgetField}
                width={width}
                height={height}
                disabledViewer={true}
                onFileClick={onFileClick}
                imageControlEnabled={imageControlEnabled}
                previewMode={previewEnabled ? 'auto' : 'iconOnly'}
            />
        </PreviewCardLayout>
    )
}

export default React.memo(FilePreviewCard)
