import React, { useCallback } from 'react'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import { useModalInvoke } from '@components/ModalInvoke/hooks/useModalInvoke'
import { PureModalInvoke } from '@components/ModalInvoke/copmonents/PureModalInvoke'

const ConnectedModalInvoke: React.FunctionComponent = () => {
    const { cancelText, okText, title, message, confirmOperationType, closeModal, sendOperation, visible, bcName, operationType } =
        useModalInvoke()

    const isOperationInProgress = useOperationInProgress(bcName as string)

    const handleOk = useCallback(
        (value: string) => {
            sendOperation(value)
            closeModal()
        },
        [closeModal, sendOperation]
    )

    return (
        <PureModalInvoke
            visible={visible}
            title={title}
            message={message}
            okText={okText}
            cancelText={cancelText}
            confirmOperationType={confirmOperationType}
            loading={isOperationInProgress(operationType)}
            onOk={handleOk}
            onCancel={closeModal}
        />
    )
}

export default React.memo(ConnectedModalInvoke)
