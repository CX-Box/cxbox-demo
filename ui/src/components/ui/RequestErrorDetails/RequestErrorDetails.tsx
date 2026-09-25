import React, { useCallback, useMemo, useState } from 'react'
import { Icon, message } from 'antd'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import cn from 'classnames'
import { useAppSelector } from '@store'
import { RequestErrorInfo } from '@utils/requestErrorInfo'
import { AUTH_ERROR_MODE, signInCallbackDetectionOfThisBrowser, userManagerOfThisBrowser } from '@constants'
import { CLIENT_ID } from '../../../api'
import styles from './RequestErrorDetails.less'

const DATE_FORMAT = 'DD.MM.YYYY HH:mm:ss.SSS'

const formatDate = (iso?: string) => (iso ? moment(iso).format(DATE_FORMAT) : '—')

interface RequestErrorDetailsProps {
    info?: RequestErrorInfo | null
    /** Added to the copied JSON */
    extra?: Record<string, unknown>
    children?: React.ReactNode
}

/**
 * For the support team. The expanded part is what they need to find the request in the server log
 * from a screenshot. "Copy details" is always visible: business users press it without opening anything.
 */
function RequestErrorDetails({ info, extra, children }: RequestErrorDetailsProps) {
    const sessionId = useAppSelector(state => state.session.sessionId)
    const login = useAppSelector(state => state.session.login)
    const screenName = useAppSelector(state => state.screen.screenName)
    const viewName = useAppSelector(state => state.view.name)
    const { t } = useTranslation()
    const [expanded, setExpanded] = useState(false)

    const detailsText = useMemo(
        () =>
            JSON.stringify(
                {
                    sessionId: sessionId ?? null,
                    clientId: CLIENT_ID,
                    login: login ?? null,
                    location: window.location.href,
                    screen: screenName ?? null,
                    view: viewName ?? null,
                    ...extra,
                    statusCode: info?.statusCode ?? null,
                    statusText: info?.responseStatusText ?? null,
                    method: info?.method ?? null,
                    url: info?.url ?? null,
                    startedAt: info?.startedAt ?? null,
                    finishedAt: info?.finishedAt ?? null,
                    responseHeaders: info?.responseHeaders ?? null,
                    responseBody: info?.responseData ?? null,
                    userAgent: info?.browser ?? navigator.userAgent,
                    webLocks: info?.webLocks ?? 'locks' in navigator,
                    indexedDb: info?.indexedDb ?? 'indexedDB' in window,
                    userManager: userManagerOfThisBrowser(),
                    authErrorMode: AUTH_ERROR_MODE,
                    signInCallbackDetection: signInCallbackDetectionOfThisBrowser()
                },
                undefined,
                2
            ),
        [info, extra, sessionId, login, screenName, viewName]
    )

    const handleCopyDetails = useCallback(() => {
        copyToClipboard(detailsText)
        message.success(t('Copied'), 1.5)
    }, [detailsText, t])

    const handleToggle = useCallback(() => {
        if (!expanded) {
            handleCopyDetails()
        }
        setExpanded(!expanded)
    }, [expanded, handleCopyDetails])

    return (
        <div className={styles.root} data-test-request-error-details={true}>
            <div className={styles.links}>
                <span
                    className={cn(styles.link, styles.toggle)}
                    role="button"
                    onClick={handleToggle}
                    data-test-request-error-details-button-toggle={true}
                    aria-expanded={expanded}
                    aria-label={t('Details')}
                    title={t('Details')}
                >
                    <Icon className={cn(styles.arrow, { [styles.arrowExpanded]: expanded })} type="right" />
                </span>
                <span className={styles.link} role="button" onClick={handleCopyDetails} data-test-request-error-details-button-copy={true}>
                    <Icon type="copy" />
                    {t('Copy details')}
                </span>
            </div>
            {expanded && (
                <div className={styles.content}>
                    <dl className={styles.details}>
                        <dt>{t('Session')}</dt>
                        <dd data-test-request-error-details-value="sessionId">{sessionId || '—'}</dd>
                        <dt>{t('Started')}</dt>
                        <dd data-test-request-error-details-value="startedAt">{formatDate(info?.startedAt)}</dd>
                        <dt>{t('Finished')}</dt>
                        <dd data-test-request-error-details-value="finishedAt">{formatDate(info?.finishedAt)}</dd>
                        <dt>{t('Error code')}</dt>
                        <dd data-test-request-error-details-value="status">
                            {[info?.statusCode, info?.responseStatusText].filter(Boolean).join(' ') || '—'}
                        </dd>
                        <dt>{t('Request')}</dt>
                        <dd data-test-request-error-details-value="request">
                            {[info?.method, info?.url].filter(Boolean).join(' ') || '—'}
                        </dd>
                    </dl>
                    {children}
                </div>
            )}
        </div>
    )
}

export default React.memo(RequestErrorDetails)

function copyToClipboard(text: string) {
    const fallbackCopy = () => {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
    }

    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(fallbackCopy)
    } else {
        fallbackCopy()
    }
}
