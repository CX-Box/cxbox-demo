import React from 'react'
import { Select } from 'antd'
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
            dropdownClassName={styles.dropdown}
            value={currency}
            maxTagCount={2}
            disabled={disabled}
            mode={multiple ? 'multiple' : 'default'}
            showArrow={true}
            onChange={onChangeCurrency}
        >
            {currencyValues?.map(item => (
                <Select.Option key={item.value}>{item.value}</Select.Option>
            ))}
        </Select>
    )
}

export default React.memo(CurrencySelect)
