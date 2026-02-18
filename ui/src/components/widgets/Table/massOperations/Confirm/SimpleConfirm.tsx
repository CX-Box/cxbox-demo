import React from 'react'
import { Icon, Input } from 'antd'
import { useAppSelector } from '@store'
import { actions } from '@actions'
import { selectWidget } from '@selectors/selectors'
import { OperationPostInvokeConfirmType, OperationPreInvokeType, WidgetFormMeta } from '@cxbox-ui/core'
import Button from '@components/ui/Button/Button'
import styles from './SimpleConfirm.module.less'
import { useModalInvoke } from '@components/ModalInvoke/hooks/useModalInvoke'
import { useDispatch } from 'react-redux'
import Title from '@components/widgets/Table/massOperations/Title'
import cn from 'classnames'

interface SimpleConfirmProps {
    widgetName: string
}

function SimpleConfirm({ widgetName }: SimpleConfirmProps) {
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as WidgetFormMeta
    const bcName = widget?.bcName as string

    const dispatch = useDispatch()

    const { cancelText, okText, title, message, confirmOperationType, sendOperation, visible } = useModalInvoke('mass')

    const [value, setValue] = React.useState('')

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
                    <>
                        {message && <p className={styles.multiline}>{message}</p>}
                        {showInput && <Input value={value} onChange={handleChange} />}
                    </>
                )
            }
            default:
                return null
        }
    }

    const getIcon = () => {
        switch (confirmOperationType) {
            case OperationPreInvokeType.info:
                return <Icon type="info-circle" className={styles.icon} />
            case OperationPreInvokeType.error: {
                return <Icon type="close-circle" className={styles.icon} />
            }
            default:
                return null
        }
    }

    const icon = getIcon()

    return (
        <div className={cn(styles.root)}>
            {icon}
            <Title level={2} title={title} className={styles.title} marginBottom={0} />
            <div className={styles.content}>{getContent()}</div>
            <div className={styles.actions}>
                <Button
                    onClick={() => {
                        const needSendOperation = OperationPreInvokeType.error !== confirmOperationType

                        needSendOperation && sendOperation(value || 'ok', actions.changeOperationStep({ bcName, step: 'View results' }))
                    }}
                >
                    {okText}
                </Button>
                {![OperationPreInvokeType.error, OperationPreInvokeType.info].includes(confirmOperationType as any) && (
                    <Button
                        onClick={() => {
                            dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
                            dispatch(actions.resetViewerMode({ bcName }))
                        }}
                        type="formOperation"
                    >
                        {cancelText}
                    </Button>
                )}
            </div>
        </div>
    )
}

export default React.memo(SimpleConfirm)
