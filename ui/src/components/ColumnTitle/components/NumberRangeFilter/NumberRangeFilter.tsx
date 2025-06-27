import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import NumberInput, { NumberInputProps } from '@components/ui/NumberInput/NumberInput'
import RangeTransferButtons from '@components/ColumnTitle/components/RangeTransferButtons/RangeTransferButtons'
import { isEmptyValue } from '../utils'
import { initialFilterValues } from './constants'
import { DataValue } from '@cxbox-ui/schema'
import styles from './NumberRangeFilter.less'

interface NumberRangeFilterProps extends Omit<NumberInputProps, 'onChange' | 'value'> {
    onChange: (v: DataValue[] | null) => void
    value: DataValue[]
}

export const NumberRangeFilter: React.FC<NumberRangeFilterProps> = ({ value, onChange, ...rest }) => {
    const { t } = useTranslation()

    const [startValue, endValue] = Array.isArray(value) ? value : initialFilterValues

    const [localValues, setLocalValues] = useState<DataValue[]>([startValue, endValue])

    const handleChangeOnBlur = useCallback(
        (type: 'start' | 'end'): NumberInputProps['onChange'] => {
            return value => {
                let newFilter

                if (type === 'start') {
                    const newStartValue = isEmptyValue(value) ? null : endValue && value > Number(endValue) ? endValue : String(value)
                    newFilter = [newStartValue, endValue]
                } else {
                    const newEndValue = isEmptyValue(value) ? null : startValue && value < Number(startValue) ? startValue : String(value)
                    newFilter = [startValue, newEndValue]
                }

                onChange(newFilter.some(item => !isEmptyValue(item)) ? newFilter : null)
            }
        },
        [endValue, onChange, startValue]
    )

    const handleChangeLocalValues = useCallback(
        (type: 'start' | 'end'): NumberInputProps['onChangeInputValue'] => {
            return value => {
                if (isNaN(value)) {
                    setLocalValues([startValue, endValue])
                } else {
                    const newStartLocalValue = type === 'start' ? value : localValues[0]
                    const newEndLocalValue = type === 'end' ? value : localValues[1]

                    setLocalValues([newStartLocalValue, newEndLocalValue])
                }
            }
        },
        [endValue, localValues, startValue]
    )

    useEffect(() => {
        setLocalValues([startValue, endValue])
    }, [endValue, startValue])

    return (
        <div className={styles.container}>
            <NumberInput
                {...rest}
                data-test-filter-popup-start-value={true}
                placeholder={t('From')}
                value={startValue as number}
                onChange={handleChangeOnBlur('start')}
                onChangeInputValue={handleChangeLocalValues('start')}
                forceFocus={true}
            />

            <RangeTransferButtons startValue={startValue} endValue={endValue} localValues={localValues} onChange={onChange} />

            <NumberInput
                {...rest}
                data-test-filter-popup-end-value={true}
                placeholder={t('To')}
                value={endValue as number}
                onChange={handleChangeOnBlur('end')}
                onChangeInputValue={handleChangeLocalValues('end')}
            />
        </div>
    )
}

export default React.memo(NumberRangeFilter)
