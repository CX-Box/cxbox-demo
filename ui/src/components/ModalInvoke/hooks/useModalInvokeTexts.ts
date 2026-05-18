import { OperationPostInvokeConfirm, OperationPostInvokeConfirmType, OperationPreInvokeType } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'

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

export function useModalInvokeTexts(confirmOperationType: string | undefined, preInvokeConfig?: OperationPostInvokeConfirm) {
    const { t } = useTranslation()

    return {
        okText: preInvokeConfig?.okText || t('Ok'),
        cancelText: preInvokeConfig?.cancelText || t('Cancel'),
        message: preInvokeConfig?.message ?? t(DEFAULT_MESSAGES[confirmOperationType || 'default'] ?? DEFAULT_MESSAGES.default),
        title: preInvokeConfig?.messageContent ?? t(DEFAULT_TITLES[confirmOperationType || 'default'] ?? DEFAULT_TITLES.default)
    }
}
