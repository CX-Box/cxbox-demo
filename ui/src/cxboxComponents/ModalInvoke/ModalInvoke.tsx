import React from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { Modal, Input } from 'antd'
import cn from 'classnames'
import styles from './ModalInvoke.less'
import { interfaces, actions } from '@cxbox-ui/core'
import { RootState } from '@store'
import { useTranslation } from 'react-i18next'

const { closeConfirmModal, sendOperation } = actions
const { OperationPostInvokeConfirmType, OperationPreInvokeType } = interfaces

interface ModalInvokeOwnProps {
    className?: string
}

interface ModalInvokeProps extends ModalInvokeOwnProps {
    bcName: string
    operationType: string
    widgetName: string
    confirmOperation?: interfaces.OperationModalInvokeConfirm
    onOk: (bcName: string, operationType: string, widgetName: string, confirm: string) => void
    onCancel: () => void
}

/**
 *
 * @param props
 * @category Components
 */
const ModalInvoke: React.FunctionComponent<ModalInvokeProps> = props => {
    const { t } = useTranslation()
    const [value, setValue] = React.useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value || (null as any))
    }

    const getContent = () => {
        switch (props.confirmOperation?.type) {
            case OperationPostInvokeConfirmType.confirm: {
                return (
                    <div>
                        <p className={styles.multiline}>{props.confirmOperation?.message || t('Perform an additional action?')}</p>
                    </div>
                )
            }
            case OperationPostInvokeConfirmType.confirmText: {
                return (
                    <div>
                        {props.confirmOperation?.message && <p className={styles.multiline}>{props.confirmOperation?.message}</p>}
                        {<Input value={value} onChange={handleChange} />}
                    </div>
                )
            }
            case OperationPreInvokeType.info: {
                return (
                    <div>
                        <p className={styles.multiline}>{props.confirmOperation?.message || t('Action has warning')}</p>
                    </div>
                )
            }
            case OperationPreInvokeType.error: {
                return (
                    <div>
                        <p className={styles.multiline}>{props.confirmOperation?.message || t('Action cannot be performed')}</p>
                    </div>
                )
            }
            default:
                return null
        }
    }

    const okLabel = props.confirmOperation?.okText || t('Ok')
    const cancelLabel = props.confirmOperation?.cancelText || t('Cancel')

    switch (props.confirmOperation?.type) {
        case OperationPreInvokeType.info: {
            const modal = Modal.info({
                className: styles.modal,
                title: props.confirmOperation?.messageContent,
                okText: okLabel,
                cancelText: cancelLabel,
                onOk: () => {
                    props.onOk(props.bcName, props.operationType, props.widgetName, value || 'ok')
                    modal.destroy()
                },
                content: getContent()
            })
            return null
        }
        case OperationPreInvokeType.error: {
            const modal = Modal.error({
                className: styles.modal,
                title: props.confirmOperation?.messageContent,
                okText: okLabel,
                cancelText: cancelLabel,
                onOk: () => {
                    props.onCancel()
                    modal.destroy()
                },
                content: getContent()
            })
            return null
        }
        default: {
            return (
                <Modal
                    className={cn(styles.modal, props.className)}
                    visible={true}
                    title={props.confirmOperation?.messageContent || t('Are you sure?')}
                    okText={okLabel}
                    cancelText={cancelLabel}
                    wrapProps={{
                        'data-test-confirm-popup': true
                    }}
                    okButtonProps={
                        {
                            'data-test-confirm-popup-button-ok': true
                        } as any
                    }
                    cancelButtonProps={
                        {
                            'data-test-confirm-popup-button-cancel': true
                        } as any
                    }
                    onOk={() => {
                        props.onOk(props.bcName, props.operationType, props.widgetName, value || 'ok')
                    }}
                    onCancel={() => {
                        props.onCancel()
                    }}
                >
                    {getContent()}
                </Modal>
            )
        }
    }
}

function mapStateToProps(state: RootState) {
    const modalInvoke = state.view.modalInvoke
    const operation = modalInvoke?.operation
    const confirmOperation = modalInvoke?.confirmOperation
    return {
        bcName: operation?.bcName ?? '',
        operationType: operation?.operationType ?? '',
        widgetName: operation?.widgetName ?? '',
        confirmOperation
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onOk: (bcName: string, operationType: string, widgetName: string, confirm?: string) => {
            dispatch(sendOperation({ bcName, operationType, widgetName, confirm }))
            dispatch(closeConfirmModal(null))
        },
        onCancel: () => {
            dispatch(closeConfirmModal(null))
        }
    }
}

/**
 * @category Components
 */
const ConnectedModalInvoke = connect(mapStateToProps, mapDispatchToProps)(ModalInvoke)

export default ConnectedModalInvoke
