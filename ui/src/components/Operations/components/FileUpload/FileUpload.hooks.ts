import { OperationInfo } from '@interfaces/widget'
import { useTranslation } from 'react-i18next'

export const useFileUploadHint = (operationInfo?: OperationInfo) => {
    const { t } = useTranslation()

    const hintPermission = operationInfo?.fileAccept
        ?.split(',')
        ?.map(item => item.slice(1).toUpperCase())
        ?.join(', ')

    return hintPermission ? t('Supports only format', { permission: hintPermission }) : ''
}
