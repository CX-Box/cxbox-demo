import { useAppSelector } from '@store'
import { OperationPreInvokeCustom } from '@interfaces/operation'
import { useCallback } from 'react'
import { actions } from '@actions'
import { useDispatch } from 'react-redux'

export const usePopupVisibility = (widgetName: string, bcName: string, mode: 'default' | 'mass' = 'default') => {
    const viewerMode = useAppSelector(state => state.screen.viewerMode[bcName]?.mode) ?? 'default'
    const popupData = useAppSelector(state => state.view.popupData)
    const dispatch = useDispatch()

    const closePopup = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName }))
    }, [bcName, dispatch])

    return {
        popupData,
        visibility: popupData?.widgetName === widgetName && mode === viewerMode,
        preInvoke: popupData?.options?.operation?.preInvoke as OperationPreInvokeCustom | undefined,
        closePopup
    }
}
