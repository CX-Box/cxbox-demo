import React from 'react'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import cn from 'classnames'
import styles from './CheckboxFilter.less'
import { interfaces } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'

export interface CheckboxFilterProps {
    title: string
    value: interfaces.DataValue[]
    filterValues: Array<{ value: string }>
    onChange?: (values: interfaces.DataValue[]) => void
}

const emptyValue: interfaces.DataValue[] = []

export const CheckboxFilter: React.FC<CheckboxFilterProps> = props => {
    const handleCheckbox = (e: CheckboxChangeEvent) => {
        const prevValues = props.value || emptyValue
        const newValues = e.target.checked ? [...prevValues, e.target.value] : prevValues.filter(item => item !== e.target.value)
        props.onChange?.(newValues.length ? newValues : (null as any))
    }

    const handleAll = (e: CheckboxChangeEvent) => {
        const newValues = e.target.checked ? props.filterValues.map(item => item.value) : null
        props.onChange?.(newValues as any)
    }

    const { t } = useTranslation()

    return (
        <div>
            <li className={cn(styles.listItem, styles.header)}>
                <Checkbox
                    className={styles.checkbox}
                    data-test-filter-popup-select-all={true}
                    indeterminate={props.value?.length > 0 && props.value.length < props.filterValues.length}
                    checked={props.value?.length === props.filterValues.length}
                    onChange={handleAll}
                />
                {props.title ?? t('All')}
            </li>
            <ul className={styles.list}>
                {props.filterValues.map((item, index) => {
                    const checked = props.value?.some(filterValue => item.value === filterValue)
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
                })}
            </ul>
        </div>
    )
}

export default React.memo(CheckboxFilter)
