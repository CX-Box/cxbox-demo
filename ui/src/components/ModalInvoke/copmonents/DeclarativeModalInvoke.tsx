import React, { useEffect, useCallback } from 'react'
import { Modal, Input } from 'antd'
import cn from 'classnames'
import styles from './PureModalInvoke.less'
import { OperationPostInvokeConfirmType } from '@cxbox-ui/core'
import { getModalDataTestProps } from '@components/ModalInvoke/utils'
import { PureModalInvokeProps } from '@components/ModalInvoke/copmonents/PureModalInvoke'

const DeclarativeModalInvoke: React.FC<PureModalInvokeProps> = ({
    visible,
    title,
    message,
    okText,
    cancelText,
    confirmOperationType,
    loading,
    onOk,
    onCancel
}) => {
    const [value, setValue] = React.useState('')

    useEffect(() => {
        if (!visible) {
            setValue('')
        }
    }, [visible])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value || (null as any))
    }, [])

    if (!visible) {
        return null
    }

    const { cancelButtonProps, okButtonProps, wrapProps } = getModalDataTestProps()
    const showInput = OperationPostInvokeConfirmType.confirmText === confirmOperationType

    const content = (
        <div>
            {message && <p className={styles.multiline}>{message}</p>}
            {showInput && <Input value={value} onChange={handleChange} />}
        </div>
    )

    return (
        <Modal
            className={cn(styles.modal, styles.overwrite)}
            visible={true}
            title={title}
            okText={okText}
            cancelText={cancelText}
            wrapProps={wrapProps}
            okButtonProps={{ ...okButtonProps, loading }}
            cancelButtonProps={cancelButtonProps}
            bodyStyle={content ? undefined : { padding: 0 }}
            onOk={() => onOk(value || 'ok')}
            onCancel={onCancel}
            {...getModalDataTestProps()}
        >
            {content}
        </Modal>
    )
}

export default React.memo(DeclarativeModalInvoke)
