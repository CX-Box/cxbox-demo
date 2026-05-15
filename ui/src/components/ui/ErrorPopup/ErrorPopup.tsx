import React, { FunctionComponent, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@store'
import { actions, interfaces } from '@cxbox-ui/core'
import ErrorInfoForTests from '@components/ui/ErrorPopup/ErrorInfoForTests'
import ErrorPopupInner from '@components/ui/ErrorPopup/ErrorPopupInner'

interface ErrorPopupProps {
    className?: string
    title?: string
    error: interfaces.ApplicationError
    onClose?: () => void
}

const ErrorPopup: FunctionComponent<ErrorPopupProps> = props => {
    const systemError = props.error as interfaces.SystemError
    const exportStateEnabled = useAppSelector(state => !!state.session.exportStateEnabled)

    const dispatch = useDispatch()

    const exportState = useCallback(() => dispatch(actions.exportState(null)), [dispatch])

    return (
        <ErrorPopupInner
            className={props.className}
            title={props.title}
            error={props.error}
            onClose={props.onClose}
            exportStateEnabled={exportStateEnabled}
            onExportState={exportState}
        >
            <ErrorInfoForTests error={systemError} />
        </ErrorPopupInner>
    )
}

export default ErrorPopup
