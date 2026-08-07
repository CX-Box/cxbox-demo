import { useAppSelector } from '@store'
import { shallowEqual, useDispatch } from 'react-redux'
import { actions, OperationPostInvokeConfirmType, OperationPreInvokeType } from '@cxbox-ui/core'
import { useCallback } from 'react'
import { AnyAction } from '@reduxjs/toolkit'
import { useModalInvokeTexts } from '@components/ModalInvoke/hooks/useModalInvokeTexts'

export const useModalInvoke = (mode: 'mass' | 'default' = 'default') => {
    const { bcName, operationType, widgetName, confirmOperation, confirmOperationType, visible } = useAppSelector(state => {
        const modalInvoke = state.view.modalInvoke
        const bcName = modalInvoke?.operation?.bcName
        const bcViewerMode = state.screen.viewerMode[bcName as string]?.mode ?? 'default'

        return {
            visible: !!modalInvoke?.operation && bcViewerMode === mode,
            bcName,
            operationType: modalInvoke?.operation?.operationType,
            widgetName: modalInvoke?.operation?.widgetName,
            confirmOperation: modalInvoke?.confirmOperation,
            confirmOperationType: modalInvoke?.confirmOperation?.type as OperationPostInvokeConfirmType | OperationPreInvokeType
        }
    }, shallowEqual)

    const modalInvokeTexts = useModalInvokeTexts(confirmOperationType, confirmOperation)

    const dispatch = useDispatch()

    const closeModal = useCallback(() => {
        dispatch(actions.closeConfirmModal(null))
    }, [dispatch])

    const sendOperation = useCallback(
        (confirm?: string, onSuccessAction?: AnyAction) => {
            if (bcName && operationType) {
                dispatch(actions.sendOperation({ bcName, operationType, widgetName: widgetName as string, confirm, onSuccessAction }))
            }
        },
        [bcName, dispatch, operationType, widgetName]
    )

    return {
        bcName,
        operationType,
        widgetName,
        visible,
        ...modalInvokeTexts,
        confirmOperationType,
        closeModal,
        sendOperation
    }
}
