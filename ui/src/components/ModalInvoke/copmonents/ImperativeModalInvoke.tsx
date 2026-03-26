import React, { useEffect, useRef } from 'react'
import { Modal } from 'antd'
import styles from './PureModalInvoke.less'
import { OperationPreInvokeType } from '@cxbox-ui/core'
import { PureModalInvokeProps } from '@components/ModalInvoke/copmonents/PureModalInvoke'

const ImperativeModalInvoke: React.FC<PureModalInvokeProps> = ({
    visible,
    title,
    message,
    okText,
    cancelText,
    confirmOperationType,
    onOk,
    onCancel
}) => {
    const modalRef = useRef<{ destroy: () => void } | null>(null)

    useEffect(() => {
        if (!visible) {
            if (modalRef.current) {
                modalRef.current.destroy()
                modalRef.current = null
            }
            return
        }

        const content = message ? (
            <div>
                <p className={styles.multiline}>{message}</p>
            </div>
        ) : null

        switch (confirmOperationType) {
            case OperationPreInvokeType.info: {
                modalRef.current = Modal.info({
                    className: styles.modal,
                    title,
                    okText,
                    cancelText,
                    content,
                    onOk: () => {
                        onOk('ok')
                        modalRef.current?.destroy()
                        modalRef.current = null
                    }
                })
                break
            }
            case OperationPreInvokeType.error: {
                modalRef.current = Modal.error({
                    className: styles.modal,
                    title,
                    okText,
                    cancelText,
                    content,
                    onOk: () => {
                        onCancel()
                        modalRef.current?.destroy()
                        modalRef.current = null
                    }
                })
                break
            }
        }

        return () => {
            if (modalRef.current) {
                modalRef.current.destroy()
                modalRef.current = null
            }
        }
    }, [visible, confirmOperationType, title, okText, cancelText, message, onOk, onCancel])

    return null
}

export default React.memo(ImperativeModalInvoke)
