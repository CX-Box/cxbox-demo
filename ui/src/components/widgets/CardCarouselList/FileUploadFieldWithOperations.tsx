import React, { useCallback, useMemo } from 'react'
import { FileUploadFieldMeta } from '@interfaces/widget'
import { useFileIconClick } from '@fields/FileUpload/FileUploadContainer'
import FileUploadField from '@components/widgets/CardCarouselList/FileUploadField'
import Card from '@components/widgets/CardCarouselList/Card'
import { useWidgetOperationsNew } from '@hooks/useWidgetOperations'
import { actions, Operation } from '@cxbox-ui/core'
import { useDispatch } from 'react-redux'

const CUSTOM_EDIT_BUTTON_KEY = '_custom-edit-button'

interface FileUploadFieldWithOperationsProps extends React.HTMLAttributes<HTMLDivElement> {
    id: string
    widgetName: string
    bcName: string
    widgetField: FileUploadFieldMeta
    width: number
    height: number
    onFileClick?: (() => void) | null
}

const FileUploadFieldWithOperations: React.FC<FileUploadFieldWithOperationsProps> = ({
    widgetName,
    bcName,
    id,
    widgetField,
    width,
    height,
    onFileClick,
    children,
    ...cardProps
}) => {
    const handleFileIconClick = useFileIconClick(widgetName, bcName, id, widgetField?.key as string)
    const operations = useWidgetOperationsNew(widgetName, ['record'], false)
    const customOperationsWithDefault = useMemo(() => {
        return [{ type: CUSTOM_EDIT_BUTTON_KEY, icon: 'edit' } as (typeof operations)[number], ...operations]
    }, [operations])
    const dispatch = useDispatch()

    const getOperationProps = useCallback(
        (buttonType: string) => {
            const result: { disabled?: boolean; hidden?: boolean; onClick?: () => void; hint?: string } = {}
            const defaultOperation = operations.find(item => item.type === buttonType) as Operation | undefined

            if (defaultOperation) {
                result.onClick = () => {
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

            if (buttonType === CUSTOM_EDIT_BUTTON_KEY) {
                result.onClick = () => {
                    handleFileIconClick()
                }
            }

            return result
        },
        [bcName, dispatch, handleFileIconClick, operations, widgetName]
    )

    return (
        <Card operations={customOperationsWithDefault} getOperationProps={getOperationProps} {...cardProps}>
            {children}
            <FileUploadField
                id={id}
                widgetName={widgetName}
                bcName={bcName}
                widgetField={widgetField}
                width={width}
                height={height}
                disabledViewer={true}
                onFileClick={onFileClick}
            />
        </Card>
    )
}

export default React.memo(FileUploadFieldWithOperations)
