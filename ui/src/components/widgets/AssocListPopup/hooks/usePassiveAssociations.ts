import { useCallback, useMemo } from 'react'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { MultivalueSingleValue } from '../../../../interfaces/data'
import { shallowEqual, useDispatch } from 'react-redux'
import { DataItem } from '@cxbox-ui/core/interfaces/data'
import { $do } from '../../../../actions/types'
import { PopupData } from '@cxbox-ui/core/interfaces/view'

function useMultivalueValues() {
    const { selectedItemsFromCalleePendingData, selectedItemsFromCalleeData } = useAppSelector(state => {
        const popupData = state.view.popupData

        const associateFieldKey = popupData?.associateFieldKey

        const calleeBcName = popupData?.calleeBCName
        const calleeBc = state.screen.bo.bc[calleeBcName as string]
        const calleePendingData = state.view.pendingDataChanges?.[calleeBcName as string]?.[calleeBc.cursor as string]
        const calleeData = calleeBc && state.data[calleeBc.name]?.find(record => record.id === calleeBc.cursor)

        const selectedItemsFromCalleeData = calleeData?.[associateFieldKey as string] as MultivalueSingleValue[]
        const selectedItemsFromCalleePendingData = calleePendingData?.[associateFieldKey as string] as MultivalueSingleValue[]

        return { selectedItemsFromCalleePendingData, selectedItemsFromCalleeData }
    }, shallowEqual)

    return useMemo(() => {
        return selectedItemsFromCalleePendingData !== undefined ? selectedItemsFromCalleePendingData : selectedItemsFromCalleeData
    }, [selectedItemsFromCalleeData, selectedItemsFromCalleePendingData])
}

function useMultivalueHandlers(currentValues: MultivalueSingleValue[]) {
    const { bcName, cursor, associateFieldKey, assocValueKey } = useAppSelector(state => {
        const { calleeBCName = '', associateFieldKey = '', assocValueKey = '' } = state.view.popupData as PopupData
        const calleeBc = state.screen.bo.bc[calleeBCName]

        return {
            bcName: calleeBc?.name,
            cursor: calleeBc?.cursor ?? '',
            associateFieldKey,
            assocValueKey
        }
    }, shallowEqual)

    const dispatch = useDispatch()

    const changeDataItem = useCallback(
        (value: MultivalueSingleValue[]) => {
            dispatch(
                $do.changeDataItem({
                    bcName,
                    cursor,
                    dataItem: {
                        [associateFieldKey]: value
                    }
                })
            )
        },
        [associateFieldKey, bcName, cursor, dispatch]
    )

    const convertToMultivalue = useCallback(
        (record: Record<string, any>, options = {}) => {
            const assocValue = record[assocValueKey] as string

            return { id: record.id, value: assocValue, options }
        },
        [assocValueKey]
    )

    const changeItem = useCallback(
        (record: Record<string, any>, options?: Record<string, any>) => {
            let newValue = [...currentValues]

            if (options?.primary) {
                newValue = newValue.map(value => {
                    return value.options.primary ? { ...value, options: { ...value.options, primary: false } } : value
                })
            }

            const isExist = newValue.some(value => value.id === record.id)

            changeDataItem(
                isExist
                    ? newValue.map(value => (value.id === record.id ? { ...value, options: { ...value.options, ...options } } : value))
                    : [...newValue, convertToMultivalue(record, options)]
            )
        },
        [changeDataItem, convertToMultivalue, currentValues]
    )

    const selectItem = useCallback(
        (record: Record<string, any>, selected: boolean) => {
            let newValue = [...currentValues]

            if (selected) {
                newValue.push(convertToMultivalue(record))
                changeDataItem(newValue)
            } else if (!selected) {
                changeDataItem(newValue.filter(value => value.id !== record.id))
            }
        },
        [changeDataItem, convertToMultivalue, currentValues]
    )

    const selectAllItems = useCallback(
        (selected: boolean, selectedRows: DataItem[], changedRows: DataItem[]) => {
            const newValue = [...currentValues]

            if (selected) {
                const uniqueChangedRows = changedRows
                    .filter(changedRow => !currentValues.some(value => value.id === changedRow.id))
                    .map(convertToMultivalue)

                changeDataItem([...newValue, ...uniqueChangedRows])
            } else if (!selected) {
                changeDataItem(newValue.filter(value => !changedRows.some(changedRow => changedRow.id === value.id)))
            }
        },
        [changeDataItem, convertToMultivalue, currentValues]
    )

    return {
        changeItem,
        selectItem,
        selectAllItems,
        convertToMultivalue
    }
}

export const usePassiveAssociations = () => {
    const values = useMultivalueValues()
    const handlers = useMultivalueHandlers(values)

    return {
        values,
        ...handlers
    }
}
