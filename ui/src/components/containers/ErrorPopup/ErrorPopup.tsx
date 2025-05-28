import React, { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@store'
import { actions } from '@cxbox-ui/core'
import { default as CoreErrorPopup } from '@components/ui/ErrorPopup/ErrorPopup'

function ErrorPopup() {
    const { error, closeError } = useErrorPopup()

    return error ? <CoreErrorPopup error={error} onClose={closeError} /> : null
}

export default React.memo(ErrorPopup)

function useErrorPopup() {
    const error = useAppSelector(state => state.view.error)

    const dispatch = useAppDispatch()

    const closeError = useCallback(() => {
        dispatch(actions.closeViewError(null))
    }, [dispatch])

    return {
        error,
        closeError
    }
}
