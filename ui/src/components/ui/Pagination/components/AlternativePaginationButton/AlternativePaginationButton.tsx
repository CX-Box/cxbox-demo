import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Popover } from 'antd'
import { useAppDispatch, useAppSelector } from '@store'
import { actions } from '@actions'
import { paginationTypeButtonPopoverText } from './constants'
import { PaginationMode } from '@constants/pagination'
import styles from './AlternativePaginationButton.module.less'

export interface AlternativePaginationButtonProps {
    widgetName: string
    alternativeType: PaginationMode
}

function AlternativePaginationButton({ widgetName, alternativeType }: AlternativePaginationButtonProps) {
    const { t } = useTranslation()

    const dispatch = useAppDispatch()

    const alternativePagination = useAppSelector(state => state.screen.alternativePagination)

    const alternativePaginationTypeEnabled = widgetName in alternativePagination

    const changePaginationType = useCallback(() => {
        dispatch(
            actions.setAlternativePaginationType({
                widgetName,
                type: alternativeType
            })
        )
    }, [alternativeType, dispatch, widgetName])

    return (
        <Popover
            content={t(
                alternativePaginationTypeEnabled
                    ? 'Alternative pagination type is already applied. Reload the page to return to default pagination'
                    : paginationTypeButtonPopoverText[alternativeType]
            )}
            placement="topLeft"
        >
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
