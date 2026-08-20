import React from 'react'
import styles from './Header.less'
import { useTranslation } from 'react-i18next'
import Select from '@components/ui/Select/Select'
import { WidgetMeta } from '@cxbox-ui/core'
import { useTableShowAllRecords, useFilterGroups } from '../hooks/hooks'
import ActionLink from '@components/ui/ActionLink/ActionLink'
import Button from '@components/ui/Button/Button'
import { AppWidgetMeta } from '@interfaces/widget'
import { isTreeWidget } from '@constants/widget'
import { useTreeFilterPagination } from '@components/widgets/Table/tree/hooks/useTreeFilterPagination'

export interface HeaderProps {
    meta: WidgetMeta
}

function Header({ meta }: HeaderProps) {
    const { t } = useTranslation()
    const { filterGroups, appliedFilterGroup, appliedFiltersCount, showFilterGroups, applyFilterGroup, showClearButton, clearAllFilters } =
        useFilterGroups(meta?.bcName)
    const { showAllRecords, showAllRecordsButton } = useTableShowAllRecords(meta.bcName)
    const treeMeta = isTreeWidget(meta as AppWidgetMeta) ? (meta as AppWidgetMeta) : undefined
    const { fetchNextFilterPage, filterActive, filterPagination, filterHasNext, shownCount, count } = useTreeFilterPagination(treeMeta)

    return (
        <div className={styles.filtersContainer}>
            {showFilterGroups && (
                <Select value={appliedFilterGroup ?? t('Show all').toString()} onChange={applyFilterGroup} dropdownMatchSelectWidth={false}>
                    {filterGroups?.map(group => (
                        <Select.Option key={group.name} value={group.name}>
                            <span>{group.name}</span>
                        </Select.Option>
                    ))}
                </Select>
            )}
            {showClearButton && <ActionLink onClick={clearAllFilters}>{t('Clear filters', { count: appliedFiltersCount })}</ActionLink>}
            {showClearButton && filterActive && (
                <>
                    <span style={{ marginLeft: 8, color: 'var(--field-read-color)' }}>{t('shown {{n}}', { n: shownCount })}</span>

                    {filterHasNext && filterPagination && (
                        <ActionLink style={{ marginLeft: 8 }} onClick={filterPagination.loading ? undefined : fetchNextFilterPage}>
                            {t('More {{n}}', { n: count })}
                        </ActionLink>
                    )}
                </>
            )}
            {showAllRecordsButton && <ActionLink onClick={showAllRecords}> {t('Show all records')} </ActionLink>}
        </div>
    )
}

export default React.memo(Header)
