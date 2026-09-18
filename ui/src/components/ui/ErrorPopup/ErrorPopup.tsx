import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@store'
import { actions, interfaces } from '@cxbox-ui/core'
import ErrorInfoForTests from '@components/ui/ErrorPopup/ErrorInfoForTests'
import ErrorPopupInner from '@components/ui/ErrorPopup/ErrorPopupInner'
import RequestErrorDetails from '@components/ui/RequestErrorDetails/RequestErrorDetails'

const { ApplicationErrorType } = interfaces

interface ErrorPopupProps {
    className?: string
    title?: string
    error: interfaces.ApplicationError
    onClose?: () => void
}

const ErrorPopup: FunctionComponent<ErrorPopupProps> = props => {
    const systemError = props.error as interfaces.SystemError
    const businessError = props.error as interfaces.BusinessError
    const isSystemError = props.error.type === ApplicationErrorType.SystemError
    const isBusinessError = props.error.type === ApplicationErrorType.BusinessError
    const exportStateEnabled = useAppSelector(state => !!state.session.exportStateEnabled)
    /**
     * Details of the last failed API request (see `view.lastRequestError`); absent for errors that did not come from HTTP
     */
    const requestInfo = useAppSelector(state => state.view.lastRequestError)

    const dispatch = useDispatch()

    const exportState = useCallback(() => dispatch(actions.exportState(null)), [dispatch])

    const detailsExtra = useMemo(
        () => ({
            errorType: ApplicationErrorType[props.error.type],
            code: props.error.code ?? null,
            message: isBusinessError ? businessError.message ?? null : null,
            details: isSystemError ? systemError.details ?? null : null
        }),
        [props.error, isBusinessError, isSystemError, businessError.message, systemError.details]
    )

    const requestDetails = (
        <RequestErrorDetails info={requestInfo} extra={detailsExtra}>
            {isSystemError && systemError.details && <div>{systemError.details}</div>}
            {isSystemError && systemError.error && (
                <textarea
                    data-test-error-popup-text={true}
                    readOnly={true}
                    value={JSON.stringify(systemError.error.response, undefined, 2)}
                    style={{ width: '100%', minHeight: 160, marginTop: 8, fontFamily: 'monospace' }}
                />
            )}
        </RequestErrorDetails>
    )

    return (
        <ErrorPopupInner
            className={props.className}
            title={props.title}
            error={props.error}
            onClose={props.onClose}
            exportStateEnabled={exportStateEnabled}
            onExportState={exportState}
            requestDetails={requestDetails}
        >
            <ErrorInfoForTests error={systemError} />
        </ErrorPopupInner>
    )
}

export default ErrorPopup
