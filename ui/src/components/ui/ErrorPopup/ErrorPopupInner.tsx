import React from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { Modal, Form, Collapse, Button, Icon } from 'antd'
import { interfaces } from '@cxbox-ui/core'
import styles from '@components/ui/ErrorPopup/ErrorPopupInner.less'

const { ApplicationErrorType } = interfaces

export interface ErrorPopupInnerProps {
    className?: string
    title?: string
    error: interfaces.ApplicationError
    forceBusinessMessage?: React.ReactNode
    onClose?: () => void

    exportStateEnabled?: boolean // manage the export button
    onExportState?: () => void
    children?: React.ReactNode
}

const ErrorPopupInner: React.FC<ErrorPopupInnerProps> = ({
    className,
    title,
    error,
    onClose,
    exportStateEnabled,
    onExportState,
    children,
    forceBusinessMessage
}) => {
    const errorRef = React.useRef<HTMLTextAreaElement>(null)
    const systemError = error as interfaces.SystemError
    const businessError = error as interfaces.BusinessError
    const { t } = useTranslation()

    const handleCopyDetails = React.useCallback(() => {
        errorRef.current?.select()
        document.execCommand('copy')
    }, [])

    const header = (
        <header className={styles.header}>
            <Icon className={styles.icon} type="exclamation-circle-o" />
            <span className={styles.title}>{title || t('Error')}</span>
        </header>
    )

    const isExportInfoShown =
        exportStateEnabled && (error.type === ApplicationErrorType.SystemError || error.type === ApplicationErrorType.NetworkError)

    return (
        <Modal
            className={cn(styles.container, className)}
            title={header}
            visible
            centered
            destroyOnClose
            onCancel={onClose}
            footer={null}
            closeIcon={<Icon className="ant-modal-close-icon" data-test-error-popup-button-close={true} type="close" />}
            wrapProps={{ 'data-test-error-popup': true }}
        >
            {children}

            <Form layout="vertical">
                <Form.Item data-test-error-popup-text={error.type !== ApplicationErrorType.SystemError ? true : undefined}>
                    {error.type === ApplicationErrorType.BusinessError && (forceBusinessMessage ?? businessError.message)}
                    {error.type === ApplicationErrorType.SystemError && t('System error has been occurred')}
                    {error.type === ApplicationErrorType.NetworkError && t('There is no connection to the server')}
                </Form.Item>

                {error.type === ApplicationErrorType.SystemError && (
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
                                            data-test-error-popup-text={true}
                                            readOnly={true}
                                            ref={errorRef}
                                            value={JSON.stringify(systemError.error.response, undefined, 2)}
                                            style={{ width: '100%', minHeight: 160, marginTop: 8, fontFamily: 'monospace' }}
                                        />
                                    </>
                                )}
                            </Collapse.Panel>
                        </Collapse>
                    </Form.Item>
                )}

                {isExportInfoShown && (
                    <Form.Item>
                        <Button onClick={onExportState} type="link">
                            {t('Save info for developers')}
                        </Button>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    )
}

export default ErrorPopupInner
