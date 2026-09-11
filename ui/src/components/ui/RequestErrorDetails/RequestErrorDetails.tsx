import React, { useCallback, useMemo, useState } from 'react'
import { Icon, message } from 'antd'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import cn from 'classnames'
import { useAppSelector } from '@store'
import { RequestErrorInfo } from '@utils/requestErrorInfo'
import { CLIENT_ID } from '../../../api'
import styles from './RequestErrorDetails.less'

const DATE_FORMAT = 'DD.MM.YYYY HH:mm:ss.SSS'

const formatDate = (iso?: string) => (iso ? moment(iso).format(DATE_FORMAT) : '—')

interface RequestErrorDetailsProps {
    info?: RequestErrorInfo | null
    /**
     * Anything else worth having in the copied JSON (error message, details, code)
     */
    extra?: Record<string, unknown>
    /**
     * Extra content rendered inside the expanded details after the request info
     */
    children?: React.ReactNode
}

/**
 * Technical details of a failed request for error popups: one row of two links.
 *
 * The arrow expands the technical info (and copies it right away), collapsed by default: what support needs to find the request in the server log
 * from a screenshot — session id (the same value is written to the SIEM log as `session: ...`), request start/finish time,
 * status and request.
 * "Copy details" is always visible (business users press it without opening anything) and copies the full info as JSON:
 * session id, current screen/view and browser url, request, status, timings, response headers and body.
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
                    userAgent: navigator.userAgent
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

    // the arrow both expands the details and copies them right away
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
