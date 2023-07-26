import React, { useCallback } from 'react'
import { $do, ErrorPopup as CoreErrorPopup } from '@cxbox-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../../interfaces/storeSlices'

function ErrorPopup() {
    const { error, closeError } = useErrorPopup()

    return error ? <CoreErrorPopup error={error} onClose={closeError} /> : null
}

export default React.memo(ErrorPopup)

function useErrorPopup() {
    const error = useSelector((state: AppState) => state.view.error)

    const dispatch = useDispatch()

    const closeError = useCallback(() => {
        dispatch($do.closeViewError(null))
    }, [dispatch])

    return {
        error,
        closeError
    }
}
