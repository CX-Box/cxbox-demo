import React from 'react'
import { Select } from 'antd'
import checkbox from '@assets/icons/checkbox.svg'
import checkboxEmpty from '@assets/icons/checkboxEmpty.svg'
import styles from './CurrencySelect.less'

export interface CurrencySelectProps {
    currency?: string | string[]
    currencyValues?: Array<{ value: string }>
    multiple?: boolean
    disabled?: boolean
    onChangeCurrency?: (currency: string | string[]) => void
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({ currency, currencyValues, multiple, disabled, onChangeCurrency }) => {
    return (
        <Select
            className={styles.container}
            dropdownClassName={styles.dropdown}
            value={currency}
            maxTagCount={2}
            optionLabelProp="label"
            disabled={disabled}
            mode={multiple ? 'multiple' : 'default'}
            showArrow={true}
            onChange={onChangeCurrency}
        >
            {currencyValues?.map(item => {
                if (multiple) {
                    const valueIndex = (currency as string[])?.findIndex(value => value === item.value)
                    return (
                        <Select.Option key={item.value} label={item.value}>
                            {valueIndex >= 0 ? <img alt="checkbox" src={checkbox} /> : <img alt="checkboxEmpty" src={checkboxEmpty} />}
                            <span className={styles.span}>{item.value}</span>
                        </Select.Option>
                    )
                } else {
                    return (
                        <Select.Option key={item.value} label={item.value}>
                            {item.value}
                        </Select.Option>
                    )
                }
            })}
        </Select>
    )
}

export default React.memo(CurrencySelect)
