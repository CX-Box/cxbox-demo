import React from 'react'
import { Modal, Input } from 'antd'
import cn from 'classnames'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import styles from './ModalInvoke.module.less'
import { OperationPostInvokeConfirmType, OperationPreInvokeType } from '@cxbox-ui/core'
import { useModalInvoke } from '@components/ModalInvoke/hooks/useModalInvoke'
import { ModalProps } from 'antd/lib/modal'

interface ModalInvokeProps {}

const ModalInvoke: React.FunctionComponent<ModalInvokeProps> = () => {
    const { cancelText, okText, title, message, confirmOperationType, closeModal, sendOperation, visible, bcName, operationType } =
        useModalInvoke()

    const [value, setValue] = React.useState('')

    const isOperationInProgress = useOperationInProgress(bcName as string)

    if (!visible) {
        return null
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value || (null as any))
    }

    const getContent = () => {
        switch (confirmOperationType) {
            case OperationPostInvokeConfirmType.confirmText:
            case OperationPostInvokeConfirmType.confirm:
            case OperationPreInvokeType.info:
            case OperationPreInvokeType.error: {
                const showInput = OperationPostInvokeConfirmType.confirmText === confirmOperationType

                return (
                    <div>
                        {message && <p className={styles.multiline}>{message}</p>}
                        {showInput && <Input value={value} onChange={handleChange} />}
                    </div>
                )
            }
            default:
                return null
        }
    }

    switch (confirmOperationType) {
        case OperationPreInvokeType.info: {
            const modal = Modal.info({
                className: styles.modal,
                title: title,
                okText: okText,
                cancelText: cancelText,
                onOk: () => {
                    sendOperation(value || 'ok')
                    closeModal()
                    modal.destroy()
                },
                content: getContent()
            })
            return null
        }
        case OperationPreInvokeType.error: {
            const modal = Modal.error({
                className: styles.modal,
                title: title,
                okText: okText,
                cancelText: cancelText,
                onOk: () => {
                    closeModal()
                    modal.destroy()
                },
                content: getContent()
            })
            return null
        }
        default: {
            const { cancelButtonProps, okButtonProps, wrapProps } = getModalDataTestProps()

            return (
                <Modal
                    className={cn(styles.modal, styles.overwrite)}
                    visible={true}
                    title={title}
                    okText={okText}
                    cancelText={cancelText}
                    wrapProps={wrapProps}
                    okButtonProps={{ ...okButtonProps, loading: isOperationInProgress(operationType) }}
                    cancelButtonProps={cancelButtonProps}
                    bodyStyle={getContent() ? undefined : { padding: 0 }}
                    onOk={() => {
                        sendOperation(value || 'ok')
                        closeModal()
                    }}
                    onCancel={closeModal}
                    {...getModalDataTestProps()}
                >
                    {getContent()}
                </Modal>
            )
        }
    }
}

export default React.memo(ModalInvoke)

function getModalDataTestProps() {
    return {
        wrapProps: {
            'data-test-confirm-popup': true
        } as any,
        okButtonProps: {
            'data-test-confirm-popup-button-ok': true
        } as any,
        cancelButtonProps: {
            'data-test-confirm-popup-button-cancel': true
        } as any
    } as Pick<ModalProps, 'wrapProps' | 'okButtonProps' | 'cancelButtonProps'>
}
