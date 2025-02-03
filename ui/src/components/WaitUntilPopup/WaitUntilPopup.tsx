import React, { useCallback } from 'react'
import { Modal, Spin } from 'antd'
import { useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'
import styles from './WaitUntilPopup.module.css'
import Button from '@components/ui/Button/Button'
import { useDispatch } from 'react-redux'
import { actions } from '@actions'

interface WaitUntilPopupProps {}

function WaitUntilPopup(props: WaitUntilPopupProps) {
    const { t } = useTranslation()

    const popupData = useAppSelector(state => state.view.popupData)
    const { type, options, bcName } = popupData || {}
    const visibility = type === 'waitUntil'
    const { message, status } = options || {}
    const isFinishStatus = ['success', 'timeout'].includes(status as string)
    const hasCompletionMessage = isFinishStatus && message
    const waiting = !isFinishStatus

    const dispatch = useDispatch()
    const closePopup = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName }))
    }, [bcName, dispatch])

    return (
        <div>
            <Modal
                className={styles.modal}
                visible={visibility}
                closable={true}
                cancelText={null}
                centered={true}
                footer={null}
                maskClosable={false}
                maskStyle={{ backdropFilter: 'blur(50px)' }}
                onCancel={closePopup}
            >
                <div className={styles.content}>
                    <span className={styles.title}>{t('Please, wait')}</span>
                    <Spin className={styles.spin} spinning={waiting} size="large" />
                    <span className={styles.text}>{message ?? t('Operation in progress')}</span>
                </div>
                <div className={styles.footer}>
                    {hasCompletionMessage && (
                        <Button type="formOperationRed" onClick={closePopup}>
                            {t('Ok')}
                        </Button>
                    )}
                </div>
            </Modal>
        </div>
    )
}

export default React.memo(WaitUntilPopup)
