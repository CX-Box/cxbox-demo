import React from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { Modal, Input } from 'antd'
import cn from 'classnames'
import styles from './ModalInvoke.less'
import { actions, OperationModalInvokeConfirm, OperationPostInvokeConfirmType, OperationPreInvokeType } from '@cxbox-ui/core'
import { RootState } from '@store'
import { useTranslation } from 'react-i18next'

interface ModalInvokeOwnProps {}

interface ModalInvokeProps extends ModalInvokeOwnProps {
    bcName: string
    operationType: string
    widgetName: string
    confirmOperation?: OperationModalInvokeConfirm
    onOk: (bcName: string, operationType: string, widgetName: string, confirm: string) => void
    onCancel: () => void
}

const ModalInvoke: React.FunctionComponent<ModalInvokeProps> = props => {
    const { t } = useTranslation()
    const [value, setValue] = React.useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value || (null as any))
    }

    const getContent = () => {
        switch (props.confirmOperation?.type) {
            case OperationPostInvokeConfirmType.confirm: {
                const message = props.confirmOperation?.message ?? t('Perform an additional action?')

                return message ? (
                    <div>
                        <p className={styles.multiline}>{message}</p>
                    </div>
                ) : null
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
                    className={cn(styles.modal, styles.overwrite)}
                    visible={true}
                    title={props.confirmOperation?.messageContent ?? t('Are you sure?')}
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
                    bodyStyle={getContent() ? undefined : { padding: 0 }}
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
            dispatch(actions.sendOperation({ bcName, operationType, widgetName, confirm }))
            dispatch(actions.closeConfirmModal(null))
        },
        onCancel: () => {
            dispatch(actions.closeConfirmModal(null))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalInvoke)
