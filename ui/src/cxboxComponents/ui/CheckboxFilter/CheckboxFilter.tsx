import React from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import cn from 'classnames'
import { getIconByParams } from '@cxboxComponents/ui/Dictionary/Dictionary'
import { interfaces } from '@cxbox-ui/core'
import styles from './CheckboxFilter.less'

export interface CheckboxFilterProps {
    title: string
    value: interfaces.DataValue[]
    filterValues?: Array<{ value: string; icon?: string }>
    onChange?: (values: interfaces.DataValue[]) => void
}

const emptyValue: interfaces.DataValue[] = []

/**
 *
 * @param props
 * @category Components
 */
export const CheckboxFilter: React.FC<CheckboxFilterProps> = props => {
    const { t } = useTranslation()

    const { filterValues = [] } = props
    const handleCheckbox = (e: CheckboxChangeEvent) => {
        const prevValues = props.value || emptyValue
        const newValues = e.target.checked ? [...prevValues, e.target.value] : prevValues.filter(item => item !== e.target.value)
        props.onChange?.(newValues.length ? newValues : [])
    }

    const handleAll = (e: CheckboxChangeEvent) => {
        const newValues = e.target.checked ? filterValues.map(item => item.value) : []
        props.onChange?.(newValues)
    }

    return (
        <div>
            <li className={cn(styles.listItem, styles.header)}>
                <Checkbox
                    className={styles.checkbox}
                    data-test-filter-popup-select-all={true}
                    indeterminate={props.value?.length > 0 && props.value.length < filterValues.length}
                    checked={props.value?.length === filterValues.length}
                    onChange={handleAll}
                />
                {props.title || t('Select all')}
            </li>
            <ul className={styles.list}>
                {filterValues.map((item, index) => {
                    const checked = props.value?.some(filterValue => item.value === filterValue)
                    const icon = getIconByParams(item.icon)
                    return (
                        <li className={styles.listItem} key={index}>
                            <Checkbox
                                className={styles.checkbox}
                                data-test-filter-popup-select-value={true}
                                checked={checked}
                                value={item.value}
                                onChange={handleCheckbox}
                            />
                            {icon && <span className={styles.listItemIcon}>{icon}</span>}
                            {item.value}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

/**
 * @category Components
 */
export const MemoizedCheckboxFilter = React.memo(CheckboxFilter)

export default MemoizedCheckboxFilter
