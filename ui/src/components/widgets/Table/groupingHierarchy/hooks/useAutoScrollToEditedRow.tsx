import { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from '@store'
import { isFullVisibleElement } from '@components/widgets/Table/utils/elements'
import { WidgetMeta } from '@cxbox-ui/core'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'

type EditableMode = 'expandRow' | 'inline'

export const useAutoScrollToEditedRow = <Meta extends WidgetMeta, Data extends CustomDataItem>(
    meta: Meta,
    active: boolean,
    getRowElementToScroll: (rowId: string | null) => Element | null | undefined,
    callbackBeforeScroll?: (rowId: string | null) => void
) => {
    const [editableMode, setEditableMode] = useState<EditableMode | null>(null)
    const [editableRowId, setEditableRowId] = useState<null | string>(null)
    const [editableRowIndex, setEditableRowIndex] = useState<null | number>(null)

    const selectedRow = useAppSelector(state => state.view.selectedRow)
    const recordForm = useAppSelector(state => state.view.recordForm[meta.bcName])
    const bcData = useAppSelector(state => state.data[meta.bcName] as Data[] | undefined)

    const getRowPosition = useCallback(
        (rowId: string | null) => {
            return bcData?.findIndex(item => item.id === rowId) ?? null
        },
        [bcData]
    )

    const beginWaitingScrolling = useCallback(
        (mode: EditableMode | null, rowId: string | null) => {
            setEditableRowId(rowId)
            setEditableRowIndex(getRowPosition(rowId))
            setEditableMode(mode)
        },
        [getRowPosition]
    )

    useEffect(() => {
        if (active && editableMode === null && selectedRow?.widgetName === meta.name && selectedRow?.rowId) {
            beginWaitingScrolling('inline', selectedRow?.rowId)
        }

        if (active && editableMode === null && recordForm?.widgetName === meta.name && recordForm?.cursor && recordForm?.active) {
            beginWaitingScrolling('expandRow', recordForm?.cursor)
        }
    }, [
        editableMode,
        beginWaitingScrolling,
        meta.name,
        recordForm?.active,
        recordForm?.cursor,
        recordForm?.widgetName,
        selectedRow?.rowId,
        selectedRow?.widgetName,
        active
    ])

    const scrollToLeaf = useCallback((element: Element | null | undefined) => {
        element?.scrollIntoView({ block: 'center' })
    }, [])

    const clearWaiting = useCallback(() => {
        setEditableRowId(null)
        setEditableRowIndex(null)
        setEditableMode(null)
    }, [])

    const callScroll = useCallback(() => {
        if (editableRowIndex !== null && editableRowIndex >= 0 && getRowPosition(editableRowId) !== editableRowIndex) {
            callbackBeforeScroll?.(editableRowId)

            setTimeout(() => {
                const editableRowElement = getRowElementToScroll(editableRowId as string)

                if (!editableRowElement || !editableRowElement?.checkVisibility() || !isFullVisibleElement(editableRowElement)) {
                    scrollToLeaf(editableRowElement)
                }
            }, 1)
        }
        clearWaiting()
    }, [callbackBeforeScroll, clearWaiting, editableRowId, editableRowIndex, getRowElementToScroll, getRowPosition, scrollToLeaf])

    useEffect(() => {
        if (editableMode === 'inline' && (selectedRow?.widgetName !== meta.name || !selectedRow?.rowId)) {
            callScroll()
        }

        if (editableMode === 'expandRow' && (recordForm?.widgetName !== meta.name || !recordForm?.cursor || !recordForm?.active)) {
            callScroll()
        }
    }, [
        editableMode,
        callScroll,
        meta.name,
        recordForm?.active,
        recordForm?.cursor,
        recordForm?.widgetName,
        selectedRow?.rowId,
        selectedRow?.widgetName
    ])
}
