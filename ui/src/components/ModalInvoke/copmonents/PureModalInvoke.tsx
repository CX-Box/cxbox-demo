import React from 'react'
import { OperationPostInvokeConfirmType, OperationPreInvokeType } from '@cxbox-ui/core'
import ImperativeModalInvoke from '@components/ModalInvoke/copmonents/ImperativeModalInvoke'
import DeclarativeModalInvoke from '@components/ModalInvoke/copmonents/DeclarativeModalInvoke'

export interface PureModalInvokeProps {
    visible?: boolean
    title?: string
    message?: string
    okText?: string
    cancelText?: string
    confirmOperationType?: OperationPostInvokeConfirmType | OperationPreInvokeType | string
    loading?: boolean
    onOk: (value: string) => void
    onCancel: () => void
}

export const PureModalInvoke: React.FC<PureModalInvokeProps> = props => {
    switch (props.confirmOperationType) {
        case OperationPreInvokeType.info:
        case OperationPreInvokeType.error:
            return <ImperativeModalInvoke {...props} />
        default:
            return <DeclarativeModalInvoke {...props} />
    }
}

export default React.memo(PureModalInvoke)
