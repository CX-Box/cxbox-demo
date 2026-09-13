import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Popover } from 'antd'
import { PaginationMode } from '@constants/pagination'
import { useAlternativePagination } from '@features/pagination/hooks/useAlternativePagination'
import styles from './AlternativePaginationButton.less'

export interface AlternativePaginationButtonProps {
    widgetName: string
    alternativeType: PaginationMode
}

function AlternativePaginationButton({ widgetName, alternativeType }: AlternativePaginationButtonProps) {
    const { t } = useTranslation()
    const { alternativePaginationTypeEnabled, changePaginationType, popoverText } = useAlternativePagination(widgetName, alternativeType)

    return (
        <Popover content={t(popoverText)} placement="topLeft">
            <Button
                className={styles.alternativePaginationButton}
                disabled={alternativePaginationTypeEnabled}
                icon="swap"
                onClick={changePaginationType}
            />
        </Popover>
    )
}

export default React.memo(AlternativePaginationButton)
