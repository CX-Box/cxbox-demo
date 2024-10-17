import React, { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@store'
import { actions } from '@actions'
import { NumberTypes } from './formaters'
import CoreNumberInput from './CoreNumberInput'
import { buildBcUrl } from '@utils/buildBcUrl'
import { interfaces } from '@cxbox-ui/core'
import { AppMoneyFieldMeta } from '@interfaces/widget'
import styles from './Number.less'

interface NumberProps {
    value: number
    meta: AppMoneyFieldMeta
    widgetName: string
    onChange?: (value: number) => void
    readOnly: boolean
}

export const MoneyInput = ({ widgetName, value, readOnly, onChange, meta, ...rest }: NumberProps) => {
    const dispatch = useAppDispatch()

    const currencyKey = meta.currencyKey as string
    const bcName = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName)?.bcName) as string
    const bcUrl = bcName && buildBcUrl(bcName, true)
    const cursor = useAppSelector(state => state.screen.bo.bc[bcName]?.cursor)
    const data = useAppSelector(state => state.data[bcName])?.find(item => item.id === cursor)
    const pendingCurrencyValue = useAppSelector(state => state.view.pendingDataChanges[bcName]?.[cursor as string]?.[currencyKey]) as string
    const currencyValue = currencyKey ? pendingCurrencyValue || (data?.[currencyKey] as string) : meta.currency
    const rowMeta = useAppSelector(state => bcName && bcUrl && state.view.rowMeta[bcName]?.[bcUrl])
    const rowFieldMetaCurrency = (rowMeta as interfaces.RowMeta)?.fields.find(field => field.key === currencyKey)

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

    return (
        <div className={styles.number}>
            <CoreNumberInput
                meta={meta}
                value={value}
                type={NumberTypes.money}
                currency={currencyValue}
                currencyValues={rowFieldMetaCurrency?.filterValues}
                currencyDisabled={rowFieldMetaCurrency ? rowFieldMetaCurrency.disabled : true}
                digits={meta.digits}
                nullable={meta.nullable}
                onChange={onChange}
                onChangeCurrency={handleChangeCurrency}
                readOnly={readOnly}
                {...rest}
            />
        </div>
    )
}
