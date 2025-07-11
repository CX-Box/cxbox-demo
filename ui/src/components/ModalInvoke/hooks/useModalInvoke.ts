import { useAppSelector } from '@store'
import { shallowEqual, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { actions, OperationPostInvokeConfirmType, OperationPreInvokeType } from '@cxbox-ui/core'
import { useCallback } from 'react'
import { AnyAction } from '@reduxjs/toolkit'

type DefaultTextDictionary = {
    default: string
    [key: string]: string
}

const DEFAULT_MESSAGES: DefaultTextDictionary = {
    [OperationPostInvokeConfirmType.confirm]: 'Perform an additional action?',
    [OperationPreInvokeType.info]: 'Action has warning',
    [OperationPreInvokeType.error]: 'Action cannot be performed',
    default: ''
}

const DEFAULT_TITLES: DefaultTextDictionary = {
    [OperationPreInvokeType.info]: '',
    [OperationPreInvokeType.error]: '',
    default: 'Are you sure?'
}

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

    const { t } = useTranslation()

    const okText = confirmOperation?.okText || t('Ok')
    const cancelText = confirmOperation?.cancelText || t('Cancel')
    const message = confirmOperation?.message ?? t(DEFAULT_MESSAGES[confirmOperationType] ?? DEFAULT_MESSAGES.default)
    const title = confirmOperation?.messageContent ?? t(DEFAULT_TITLES[confirmOperationType] ?? DEFAULT_TITLES.default)

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
        title,
        message,
        okText,
        cancelText,
        confirmOperationType,
        closeModal,
        sendOperation
    }
}
