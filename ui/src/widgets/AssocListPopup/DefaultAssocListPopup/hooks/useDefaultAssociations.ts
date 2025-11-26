import { useCallback } from 'react'
import { useAppSelector } from '@store'
import { shallowEqual, useDispatch } from 'react-redux'
import { actions, AssociatedItem, interfaces, PopupData } from '@cxbox-ui/core'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useAssocRecords } from '@hooks/useAssocRecords'

const emptyDataItems: AssociatedItem[] = []

function useSelectedRecords(bcName: string) {
    const { data, pendingData } = useAppSelector(state => {
        const pendingData = state.view.pendingDataChanges[bcName]
        const data = (state.data[bcName] as AssociatedItem[]) || emptyDataItems

        return { data, pendingData }
    }, shallowEqual)

    return useAssocRecords(data, pendingData)
}

function useDefaultAssocHandlers(bcName: string) {
    const assocValueKey = useAppSelector(state => (state.view.popupData as PopupData).assocValueKey ?? '')

    const dispatch = useDispatch()

    const select = useCallback(
        (record: AssociatedItem, selected: boolean) => {
            dispatch(
                actions.changeDataItem({
                    bcName,
                    bcUrl: buildBcUrl(bcName, true),
                    cursor: record.id,
                    dataItem: {
                        id: record.id,
                        vstamp: record.vstamp,
                        _value: record[assocValueKey],
                        _associate: selected
                    }
                })
            )
        },
        [assocValueKey, bcName, dispatch]
    )

    const selectAll = useCallback(
        (selected: boolean, selectedRows: interfaces.DataItem[], changedRows: interfaces.DataItem[]) => {
            const cursors = changedRows.map(item => item.id as string)
            const dataItems = changedRows.map(item => ({
                id: item.id,
                vstamp: item.vstamp,
                _value: item[assocValueKey],
                _associate: selected
            }))

            dispatch(actions.changeDataItems({ bcName, cursors, dataItems }))
        },
        [assocValueKey, bcName, dispatch]
    )

    return {
        select,
        selectAll
    }
}

export const useDefaultAssociations = (bcName: string) => {
    const values = useSelectedRecords(bcName)
    const handlers = useDefaultAssocHandlers(bcName)

    return {
        values,
        ...handlers
    }
}
