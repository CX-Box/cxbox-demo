import React, { FunctionComponent } from 'react'
import { Modal, Form, Collapse, Icon, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import styles from './ErrorPopup.less'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { Store } from '@interfaces/store'
import { ApplicationError, ApplicationErrorType, BusinessError, SystemError } from '@tesler-ui/core'
import { $do } from '@actions/types'

export interface ErrorPopupOwnProps {
    className?: string
    title?: string
    error: ApplicationError
    onClose?: () => void
}

interface ErrorPopupProps extends ErrorPopupOwnProps {
    exportState: () => void
    exportStateEnabled: boolean
}

export const ErrorPopup: FunctionComponent<ErrorPopupProps> = props => {
    const errorRef = React.useRef(null)
    const systemError = props.error as SystemError
    const businessError = props.error as BusinessError

    const handleCopyDetails = React.useCallback(() => {
        errorRef.current.select()
        document.execCommand('copy')
    }, [errorRef])
    const { t } = useTranslation()
    const title = (
        <header className={styles.header}>
            <Icon className={styles.icon} type="exclamation-circle-o" />
            <span className={styles.title}>{props.title || t('Error')}</span>
        </header>
    )

    const isExportInfoShown =
        props.exportStateEnabled &&
        (props.error.type === ApplicationErrorType.SystemError || props.error.type === ApplicationErrorType.NetworkError)

    return (
        <Modal
            className={cn(styles.container, props.className)}
            title={title}
            visible
            centered
            destroyOnClose
            onCancel={props.onClose}
            footer={null}
        >
            <Form layout="vertical">
                <Form.Item>
                    {props.error.type === ApplicationErrorType.BusinessError && businessError.message}
                    {props.error.type === ApplicationErrorType.SystemError && t('System error has been occurred')}
                    {props.error.type === ApplicationErrorType.NetworkError && t('There is no connection to the server')}
                </Form.Item>
                {props.error.type === ApplicationErrorType.SystemError && (
                    <Form.Item label={t('Error code')}>
                        {systemError.code}
                        <Collapse bordered={false}>
                            <Collapse.Panel header={t('Details')} key="1">
                                <div>{systemError.details}</div>
                                {systemError?.error && (
                                    <>
                                        <Button className={styles.copyDetailsBtn} onClick={handleCopyDetails}>
                                            {t('Copy details to clipboard')}
                                        </Button>
                                        <textarea
                                            className={cn(styles.detailsArea)}
                                            readOnly={true}
                                            ref={errorRef}
                                            value={JSON.stringify(systemError.error.response, undefined, 2)}
                                        />
                                    </>
                                )}
                            </Collapse.Panel>
                        </Collapse>
                    </Form.Item>
                )}
                {isExportInfoShown && (
                    <Form.Item>
                        <Button onClick={() => props.exportState()} type="link">
                            {t('Save info for developers')}
                        </Button>
                    </Form.Item>
                )}
            </Form>
            {props.children}
        </Modal>
    )
}

function mapStateToProps(state: Store) {
    return {
        exportStateEnabled: state.session.exportStateEnabled
    }
}
function mapDispatchToProps(dispatch: Dispatch) {
    return {
        exportState: () => dispatch($do.exportState(null))
    }
}

/**
 * @category Components
 */
const MemoizedErrorPopup = connect(mapStateToProps, mapDispatchToProps)(ErrorPopup)

export default MemoizedErrorPopup
