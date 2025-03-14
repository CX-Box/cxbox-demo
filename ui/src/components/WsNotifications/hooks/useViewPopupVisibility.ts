import { useAppSelector } from '@store'
import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { actions } from '@actions'

export const useViewPopupVisibility = () => {
    const visibility = useAppSelector(state => {
        return state.view.popupData?.options?.type === 'ws-notification'
    })

    const dispatch = useDispatch()

    const toggleVisibility = useCallback(
        (value: boolean) => {
            if (value) {
                dispatch(actions.showWsNotificationPopup({ options: { type: 'ws-notification' } }))
            } else {
                dispatch(actions.closeViewPopup(null))
            }
        },
        [dispatch]
    )

    return { visibility, toggleVisibility }
}
