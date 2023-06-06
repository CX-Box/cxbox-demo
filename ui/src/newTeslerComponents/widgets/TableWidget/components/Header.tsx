import React from 'react'
import styles from '../TableWidget.less'
import { useTranslation } from 'react-i18next'
import { useFilters } from '@imports/teslerCore'
import { ActionLink } from '@teslerComponents'
import Select from '@teslerComponents/ui/Select/Select'

export interface HeaderProps {
    widgetName: string
}

function Header({ widgetName }: HeaderProps) {
    const { t } = useTranslation()
    const {
        showAll: handleShowAll,
        removeFilters: handleRemoveFilters,
        addFilters: handleAddFilters,
        filterGroupName,
        limitBySelf,
        filtersExist,
        filterGroups,
        filterGroupsExist
    } = useFilters(widgetName)

    return (
        <div>
            <div className={styles.filtersContainer}>
                {filterGroupsExist && (
                    <Select
                        value={filterGroupName ?? t('Show all').toString()}
                        onChange={handleAddFilters}
                        dropdownMatchSelectWidth={false}
                    >
                        {filterGroups.map(group => (
                            <Select.Option key={group.name} value={group.name}>
                                <span>{group.name}</span>
                            </Select.Option>
                        ))}
                    </Select>
                )}
                {filtersExist && <ActionLink onClick={handleRemoveFilters}> {t('Clear all filters')} </ActionLink>}
                {limitBySelf && <ActionLink onClick={handleShowAll}> {t('Show all records')} </ActionLink>}
            </div>
        </div>
    )
}

export default React.memo(Header)
