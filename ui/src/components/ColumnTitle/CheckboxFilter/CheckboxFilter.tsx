import React, { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox, Empty, Input } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import cn from 'classnames'
import { useListHeight, useListSearch } from '@hooks/checkboxFilter'
import { checkboxFilterMaxVisibleItems } from '@constants/filter'
import { interfaces } from '@cxbox-ui/core'
import styles from './CheckboxFilter.less'

export interface CheckboxFilterProps {
    title: string
    value: interfaces.DataValue[]
    filterValues: Array<{ value: string }>
    visible?: boolean
    onChange?: (values: interfaces.DataValue[]) => void
}

const emptyValue: interfaces.DataValue[] = []

export const CheckboxFilter: React.FC<CheckboxFilterProps> = ({ value, filterValues, title, visible, onChange }) => {
    const { t } = useTranslation()
    const listRef = useRef<HTMLUListElement>(null)

    const filterValuesLength = filterValues.length
    const { searchText, filteredValues, handleSearch } = useListSearch(filterValues, visible)
    const listHeight = useListHeight(listRef, filterValuesLength)

    const visibleFilteredValues = useMemo(() => {
        return listHeight === undefined ? filteredValues.slice(0, checkboxFilterMaxVisibleItems) : filteredValues
    }, [filteredValues, listHeight])

    const handleCheckbox = (e: CheckboxChangeEvent) => {
        const prevValues = value || emptyValue
        const newValues = e.target.checked ? [...prevValues, e.target.value] : prevValues.filter(item => item !== e.target.value)
        onChange?.(newValues.length ? newValues : (null as any))
    }

    const handleAll = (e: CheckboxChangeEvent) => {
        const newValues = e.target.checked ? filterValues.map(item => item.value) : null
        onChange?.(newValues as any)
    }

    return (
        <div className={styles.container}>
            {filterValuesLength > checkboxFilterMaxVisibleItems && (
                <Input
                    className={styles.search}
                    value={searchText}
                    placeholder={t('Search in filters')}
                    allowClear={true}
                    onChange={handleSearch}
                />
            )}

            <li className={cn(styles.listItem, styles.header)}>
                <Checkbox
                    className={styles.checkbox}
                    data-test-filter-popup-select-all={true}
                    indeterminate={value?.length > 0 && value.length < filterValuesLength}
                    checked={value?.length === filterValuesLength}
                    onChange={handleAll}
                />
                {title ?? t('All')}
            </li>

            <ul ref={listRef} className={styles.list} style={listHeight ? { height: listHeight } : undefined}>
                {visibleFilteredValues.length ? (
                    visibleFilteredValues.map((item, index) => {
                        const checked = value?.some(filterValue => item.value === filterValue)

                        return (
                            <li className={styles.listItem} key={index}>
                                <Checkbox
                                    className={styles.checkbox}
                                    data-test-filter-popup-select-value={true}
                                    checked={checked}
                                    value={item.value}
                                    onChange={handleCheckbox}
                                />
                                {item.value}
                            </li>
                        )
                    })
                ) : (
                    <Empty className={styles.noData} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </ul>
        </div>
    )
}

export default React.memo(CheckboxFilter)
