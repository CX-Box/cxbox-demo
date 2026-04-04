import React, { useRef, useState, useCallback } from 'react'
import { Icon } from 'antd'
import { AppWidgetMeta, OperationInfo } from '@interfaces/widget'
import { Operation } from '@interfaces/rowMeta'
import { FileUpload } from '@components/Operations/components/FileUpload/FileUpload'
import Button from '@components/ui/Button/Button'
import { PureModalInvoke } from '@components/ModalInvoke/copmonents/PureModalInvoke'
import { useModalInvokeTexts } from '@components/ModalInvoke/hooks/useModalInvokeTexts'

interface OperationsFileUploadProps {
    item: Operation | undefined
    widgetMeta: AppWidgetMeta
    operationInfo: OperationInfo
    buttonType?: string
    loading?: boolean
    mode?: 'default' | 'drag'
}

const OperationsFileUpload: React.FC<OperationsFileUploadProps> = ({
    item,
    widgetMeta,
    operationInfo,
    buttonType,
    loading,
    mode = 'default',
    ...buttonProps
}) => {
    const uploadRef = useRef<HTMLDivElement | null>(null)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [droppedFiles, setDroppedFiles] = useState<File[]>([])

    const hasPreInvoke = !!item?.preInvoke

    const handleDropCapture = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            if (hasPreInvoke && e.dataTransfer.files?.length > 0) {
                e.preventDefault()
                e.stopPropagation()
                setDroppedFiles(Array.from(e.dataTransfer.files))
                setIsModalVisible(true)
            }
        },
        [hasPreInvoke]
    )

    const handleClickCapture = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (hasPreInvoke && e.isTrusted) {
                e.preventDefault()
                e.stopPropagation()
                setDroppedFiles([])
                setIsModalVisible(true)
            }
        },
        [hasPreInvoke]
    )

    const handleOk = useCallback(() => {
        const fileInput = uploadRef.current?.querySelector('input[type="file"]') as HTMLInputElement

        if (fileInput) {
            if (droppedFiles.length > 0) {
                try {
                    const dataTransfer = new DataTransfer()
                    droppedFiles.forEach(file => dataTransfer.items.add(file))

                    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'files')?.set?.call(fileInput, dataTransfer.files)
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }))
                } catch (e) {
                    console.error('File emulation failed', e)
                    fileInput.click()
                }
            } else {
                fileInput.click()
            }
        }

        setIsModalVisible(false)
        setDroppedFiles([])
    }, [droppedFiles])

    const handleCancel = useCallback(() => {
        setIsModalVisible(false)
        setDroppedFiles([])
    }, [])

    const modalTexts = useModalInvokeTexts(item?.preInvoke?.type, item?.preInvoke)

    return (
        <React.Fragment>
            <div ref={uploadRef} onDropCapture={handleDropCapture} onClickCapture={handleClickCapture}>
                <FileUpload widget={widgetMeta} operationInfo={operationInfo} mode={mode}>
                    {mode === 'default' && (
                        <Button
                            data-test-widget-action-item={true}
                            type={buttonType}
                            loading={loading}
                            bgColor={item?.customParameter?.platformBgColor}
                            {...buttonProps}
                        >
                            {item?.icon && <Icon type={item.icon} />}
                            {item?.text}
                        </Button>
                    )}
                </FileUpload>
            </div>

            {hasPreInvoke && (
                <PureModalInvoke
                    visible={isModalVisible}
                    title={modalTexts.title}
                    message={modalTexts.message}
                    okText={modalTexts.okText}
                    cancelText={modalTexts.cancelText}
                    confirmOperationType={item.preInvoke?.type}
                    onOk={handleOk}
                    onCancel={handleCancel}
                />
            )}
        </React.Fragment>
    )
}

export default React.memo(OperationsFileUpload)
