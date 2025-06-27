import React from 'react'
import styles from './Header.less'
import { useTranslation } from 'react-i18next'
import Select from '@components/ui/Select/Select'
import { WidgetMeta } from '@cxbox-ui/core'
import { useTableShowAllRecords, useFilterGroups } from '../hooks/hooks'
import ActionLink from '@components/ui/ActionLink/ActionLink'

export interface HeaderProps {
    meta: WidgetMeta
}

function Header({ meta }: HeaderProps) {
    const { t } = useTranslation()
    const { filterGroups, appliedFilterGroup, appliedFiltersCount, showFilterGroups, applyFilterGroup, showClearButton, clearAllFilters } =
        useFilterGroups(meta)
    const { showAllRecords, showAllRecordsButton } = useTableShowAllRecords(meta.bcName)

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
            {showAllRecordsButton && <ActionLink onClick={showAllRecords}> {t('Show all records')} </ActionLink>}
        </div>
    )
}

export default React.memo(Header)
