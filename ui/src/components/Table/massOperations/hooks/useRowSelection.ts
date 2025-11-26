import { useAppSelector } from '@store'
import { selectWidget } from '@selectors/selectors'
import { AppWidgetMeta, WidgetField } from '@interfaces/widget'
import { shallowEqual, useDispatch } from 'react-redux'
import { useCallback, useMemo } from 'react'
import { actions } from '@actions'
import { DataItem } from '@cxbox-ui/core'

type SelectedItem = Omit<DataItem, 'vstamp'>

export const useRowSelection = (widgetName: string) => {
    const { widget, selectedRows, bcName } = useAppSelector(state => {
        const widget = selectWidget(state, widgetName) as AppWidgetMeta | undefined
        const bcName = widget?.bcName as string

        return {
            widget,
            bcName,
            selectedRows: state.view.selectedRows[bcName]
        }
    }, shallowEqual)

    const dispatch = useDispatch()

    const getDataItem = useCallback(
        (record: SelectedItem) => {
            const result: typeof record = {
                id: record.id
            }

            const pickMapFieldKey = widget?.options?.massOp?.pickMapFieldKey

            const titleKey =
                pickMapFieldKey === null
                    ? pickMapFieldKey
                    : pickMapFieldKey ?? (widget?.fields as WidgetField[])?.find(item => item?.key)?.key

            if (titleKey) {
                result.title = record.title ?? record[titleKey]
            }

            return result
        },
        [widget?.fields, widget?.options?.massOp?.pickMapFieldKey]
    )

    const selectItems = useCallback(
        (selected: boolean, changedRows: SelectedItem[]) => {
            if (selected) {
                dispatch(
                    actions.selectRows({
                        bcName,
                        dataItems: changedRows.map(item => getDataItem(item))
                    })
                )
            } else {
                dispatch(
                    actions.deselectRows({
                        bcName,
                        ids: changedRows.map(item => item.id as string)
                    })
                )
            }
        },
        [bcName, dispatch, getDataItem]
    )

    const select = useCallback(
        (record: SelectedItem, selected: boolean) => {
            selectItems(selected, [record])
        },
        [selectItems]
    )

    const selectAll = useCallback(
        (selected: boolean, selectedRows: SelectedItem[], changedRows: SelectedItem[]) => {
            selectItems(selected, changedRows)
        },
        [selectItems]
    )

    const clearSelectedRows = useCallback(() => {
        dispatch(actions.clearSelectedRows({ bcName }))
    }, [bcName, dispatch])
    const selectedRowKeys = useMemo(() => selectedRows?.map(item => item.id as string), [selectedRows])

    return { clearSelectedRows, selectAll, select, selectItems, selectedRows, selectedRowKeys }
}
