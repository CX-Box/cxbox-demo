import React, { useCallback, useEffect, useState } from 'react'
import { Button, Icon, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@store'
import { actions, AuthErrorStatusCode } from '@actions'
import RequestErrorDetails from '@components/ui/RequestErrorDetails/RequestErrorDetails'
import { AUTH_ERROR_MODE, AUTH_ERROR_SNOOZE_SECONDS } from '@constants'
import { platformSession } from '../../auth/platformSession'
import styles from './AuthErrorPopup.less'

const MESSAGE_BY_STATUS: Record<AuthErrorStatusCode, string> = {
    401: 'Session has expired',
    403: 'Insufficient permissions'
}

/**
 * Shown after 401/403 response (see `httpError401Epic`) and when the sign in could not be completed.
 *
 * "Sign in again" goes to the provider and back: no password while the SSO session lives, and back on the same screen.
 * If the provider is not reachable, both buttons leave the popup open and it says so: what has been typed is not lost, and
 * the user can try again.
 * "Sign out" does the same as "Log out" of the user menu - the way to come back as another user.
 * Closing the popup (Esc, the cross) leaves the page as it is, so that what has been typed can be copied, and snoozes the popup
 * for `AUTH_ERROR_SNOOZE_SECONDS`. In `strict` mode (see `AUTH_ERROR_MODE`) the popup cannot be closed.
 * Technical info of the failed request (details and copy links) comes from `RequestErrorDetails`.
 */
function AuthErrorPopup() {
    const authError = useAppSelector(state => state.session.authError)
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    // 'signingIn', 'signingOut': the pressed button shows a spinner until the page leaves.
    // 'failed': the provider is not reachable, the popup says so
    const [redirect, setRedirect] = useState<'ready' | 'signingIn' | 'signingOut' | 'failed'>('ready')

    // A new popup starts clean. And "Back" on the provider page restores this page as it was: with the spinner on the button
    useEffect(() => setRedirect('ready'), [authError])
    useEffect(() => {
        const onPageShow = () => setRedirect('ready')
        window.addEventListener('pageshow', onPageShow)
        return () => window.removeEventListener('pageshow', onPageShow)
    }, [])

    const goToProvider = useCallback(
        async (button: 'signingIn' | 'signingOut') => {
            setRedirect(button)
            const result = await (button === 'signingIn' ? platformSession.signInAgain() : platformSession.signOut())
            if (result === 'useLoginForm') {
                dispatch(actions.closeAuthErrorPopup())
                dispatch(actions.logout(null))
            } else if (result === 'failed') {
                setRedirect('failed')
            }
            // 'redirecting': the popup stays until the page leaves, an empty screen says nothing
        },
        [dispatch]
    )

    const handleClose = useCallback(() => {
        dispatch(actions.closeAuthErrorPopup({ snoozedUntil: Date.now() + AUTH_ERROR_SNOOZE_SECONDS * 1000 }))
    }, [dispatch])

    if (!authError) {
        return null
    }

    const { statusCode } = authError
    const closable = AUTH_ERROR_MODE !== 'strict'

    return (
        <Modal
            className={styles.container}
            visible
            centered
            closable={closable}
            closeIcon={<Icon type="close" data-test-auth-error-popup-close={true} />}
            maskClosable={false}
            keyboard={closable}
            title={
                <header className={styles.header}>
                    <span className={styles.title} data-test-auth-error-popup-title={true}>
                        {t(MESSAGE_BY_STATUS[statusCode])}
                    </span>
                </header>
            }
            onCancel={handleClose}
            wrapProps={{ 'data-test-auth-error-popup': true, 'data-test-auth-error-popup-status': statusCode }}
            footer={[
                <Button
                    key="signOut"
                    loading={redirect === 'signingOut'}
                    disabled={redirect === 'signingIn'}
                    onClick={() => goToProvider('signingOut')}
                    data-test-auth-error-popup-button-sign-out={true}
                >
                    {t('Sign out')}
                </Button>,
                <Button
                    key="signInAgain"
                    type="primary"
                    loading={redirect === 'signingIn'}
                    disabled={redirect === 'signingOut'}
                    onClick={() => goToProvider('signingIn')}
                    data-test-auth-error-popup-button-sign-in={true}
                >
                    {t('Sign in again')}
                </Button>
            ]}
        >
            {closable && (
                <p className={styles.hint} data-test-auth-error-popup-hint={true}>
                    {t('Close this window to copy unsaved data: it comes back in {{seconds}} seconds', {
                        seconds: AUTH_ERROR_SNOOZE_SECONDS
                    })}
                </p>
            )}
            {redirect === 'failed' && (
                <p className={styles.redirectFailed} data-test-auth-error-popup-redirect-failed={true}>
                    {t('The sign in service is not reachable. Check the connection and try again')}
                </p>
            )}
            <RequestErrorDetails info={authError} />
        </Modal>
    )
}

export default React.memo(AuthErrorPopup)
