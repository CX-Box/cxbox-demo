import React, { useCallback } from 'react'
import cn from 'classnames'
import { useAppDispatch, useAppSelector } from '@store'
import { actions } from '@actions'
import { NumberTypes } from '../formaters'
import CoreNumberInput from '../CoreNumberInput'
import { buildBcUrl } from '@utils/buildBcUrl'
import { interfaces, PendingValidationFails, PendingValidationFailsFormat } from '@cxbox-ui/core'
import { AppMoneyFieldMeta } from '@interfaces/widget'
import CurrencySelect from '../CurrencySelect/CurrencySelect'
import styles from './MoneyInput.less'

interface NumberProps {
    value: number
    meta: AppMoneyFieldMeta
    widgetName: string
    cursor: string
    readOnly: boolean
    onChange?: (value: number) => void
}

export const MoneyInput = ({ widgetName, value, readOnly, onChange, meta, cursor, ...rest }: NumberProps) => {
    const dispatch = useAppDispatch()

    const currencyKey = meta.currencyKey as string
    const bcName = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName)?.bcName) as string
    const bcUrl = bcName && buildBcUrl(bcName, true)
    const data = useAppSelector(state => state.data[bcName])?.find(item => item.id === cursor)
    const pendingCurrencyValue = useAppSelector(state => state.view.pendingDataChanges[bcName]?.[cursor as string]?.[currencyKey]) as string
    const currencyValue = currencyKey ? pendingCurrencyValue || (data?.[currencyKey] as string) : meta.currency
    const rowMeta = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl])
    const rowFieldMetaCurrency = (rowMeta as interfaces.RowMeta)?.fields.find(field => field.key === currencyKey)
    const currencyDisabled = rowFieldMetaCurrency ? rowFieldMetaCurrency?.disabled : true

    const pendingValidationFailsFormat = useAppSelector(state => state.view.pendingValidationFailsFormat)
    const pendingValidationFails = useAppSelector(state => state.view.pendingValidationFails)
    const metaErrors = rowMeta?.errors
    const missingFields =
        pendingValidationFailsFormat === PendingValidationFailsFormat.target
            ? (pendingValidationFails as PendingValidationFails)?.[bcName]?.[cursor]
            : pendingValidationFails
    const error = (!currencyDisabled && missingFields?.[currencyKey]) || metaErrors?.[currencyKey]

    const handleChangeCurrency = useCallback(
        (item: string | string[]) => {
            if (bcName && cursor && currencyKey) {
                const dataItem = { [currencyKey]: item as string }
                dispatch(
                    actions.changeDataItem({
                        bcName,
                        cursor,
                        dataItem,
                        bcUrl: buildBcUrl(bcName, true)
                    })
                )
            }
        },
        [bcName, cursor, currencyKey, dispatch]
    )

    const currencySelect = currencyKey ? (
        <CurrencySelect
            currency={currencyValue}
            currencyValues={rowFieldMetaCurrency?.filterValues}
            disabled={currencyDisabled || readOnly}
            onChangeCurrency={handleChangeCurrency}
        />
    ) : (
        meta.currency
    )

    return (
        <div className={cn(styles.container, { [styles.currencyError]: error })}>
            <CoreNumberInput
                meta={meta}
                value={value}
                type={NumberTypes.money}
                currencyComponent={readOnly ? currencyValue : currencySelect}
                digits={meta.digits}
                nullable={meta.nullable}
                onChange={onChange}
                readOnly={readOnly}
                {...rest}
            />
        </div>
    )
}
