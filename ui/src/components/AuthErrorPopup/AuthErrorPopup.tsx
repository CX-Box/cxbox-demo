import React, { useCallback } from 'react'
import { Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@store'
import { actions, AuthErrorStatusCode } from '@actions'
import RequestErrorDetails from '@components/ui/RequestErrorDetails/RequestErrorDetails'
import { AUTH_ERROR_MODE, AUTH_ERROR_SNOOZE_SECONDS } from '@constants'
import styles from './AuthErrorPopup.less'

const MESSAGE_BY_STATUS: Record<AuthErrorStatusCode, string> = {
    401: 'Session has expired',
    403: 'Insufficient permissions'
}

/**
 * Shown after 401/403 response (see `httpError401Epic`).
 *
 * "Yes" does the same as the "Log out" button in the user menu: OIDC logout and redirect to the login page.
 * "No" closes the popup, lets the user continue at their own risk and snoozes the popup for `AUTH_ERROR_SNOOZE_SECONDS`.
 * In `strict` mode (see `AUTH_ERROR_MODE`) signing in again is the only option.
 * Technical info of the failed request (details and copy links) comes from `RequestErrorDetails`.
 */
function AuthErrorPopup() {
    const authError = useAppSelector(state => state.session.authError)
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const handleRelogin = useCallback(() => {
        dispatch(actions.closeAuthErrorPopup())
        dispatch(actions.logout(null))
    }, [dispatch])

    const handleContinue = useCallback(() => {
        dispatch(actions.closeAuthErrorPopup({ snoozedUntil: Date.now() + AUTH_ERROR_SNOOZE_SECONDS * 1000 }))
    }, [dispatch])

    if (!authError) {
        return null
    }

    const { statusCode } = authError
    const withNo = AUTH_ERROR_MODE !== 'strict'

    return (
        <Modal
            className={styles.container}
            visible
            centered
            closable={false}
            maskClosable={false}
            keyboard={withNo}
            title={
                <header className={styles.header}>
                    <span className={styles.title} data-test-auth-error-popup-title={true}>
                        {t(MESSAGE_BY_STATUS[statusCode])}. {t('Sign in again?')}
                    </span>
                </header>
            }
            okText={t('Yes')}
            cancelText={`${t('No')} (${AUTH_ERROR_SNOOZE_SECONDS}s)`}
            onOk={handleRelogin}
            onCancel={handleContinue}
            wrapProps={{ 'data-test-auth-error-popup': true, 'data-test-auth-error-popup-status': statusCode }}
            okButtonProps={{ 'data-test-auth-error-popup-button-ok': true } as any}
            cancelButtonProps={{ 'data-test-auth-error-popup-button-cancel': true, style: withNo ? undefined : { display: 'none' } } as any}
        >
            {withNo && (
                <p className={styles.hint} data-test-auth-error-popup-hint={true}>
                    {t('If you choose "No", you continue at your own risk')}.
                </p>
            )}
            <RequestErrorDetails info={authError} />
        </Modal>
    )
}

export default React.memo(AuthErrorPopup)
