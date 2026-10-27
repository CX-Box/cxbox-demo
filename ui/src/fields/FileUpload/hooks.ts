import { useDispatch } from 'react-redux'
import { useAppSelector } from '@store'
import { FileViewerMode } from '@interfaces/view'
import { useCallback, useEffect, useState } from 'react'
import { usePrevious } from '@hooks/usePrevious'
import { actions } from '@actions'
import { useInternalWidget } from '@hooks/useInternalWidget'

// The hook is needed so that before opening a popup, if there is unsaved data in the table row being edited, the popup will not open until the data is saved or deleted (internalFormWidgetMiddleware)
export const useFileIconClick = (widgetName: string, bcName: string, recordId: string, fieldName: string, mode?: FileViewerMode) => {
    const dispatch = useDispatch()
    const currentCursor = useAppSelector(state => state.screen.bo.bc[bcName]?.cursor)
    const massMode = useAppSelector(state => state.screen.viewerMode[bcName]?.mode === 'mass')
    const [wasClick, setWasClick] = useState(false)

    const showPopup = useCallback(
        (shownRecordId?: string) => {
            dispatch(
                actions.showFileViewerPopup({
                    active: true,
                    options: {
                        bcName,
                        type: 'file-viewer',
                        calleeFieldKey: fieldName,
                        mode,
                        recordId: shownRecordId
                    },
                    calleeWidgetName: widgetName as string
                })
            )
        },
        [bcName, dispatch, fieldName, mode, widgetName]
    )

    const handleFileIconClick = useCallback(() => {
        // rows of a mass operation are only viewed: the preview shows the row and does not make it active
        if (massMode) {
            showPopup(recordId)
            return
        }
        setWasClick(true)
    }, [massMode, recordId, showPopup])

    const previousCursor = usePrevious(currentCursor)

    useEffect(() => {
        if (currentCursor !== recordId && wasClick) {
            dispatch(actions.bcSelectRecord({ bcName, cursor: recordId }))
        }
    }, [bcName, currentCursor, dispatch, recordId, wasClick])

    const widget = useAppSelector(state => state.view.widgets.find(widget => widget.name === widgetName))

    const { internalWidget } = useInternalWidget(widget, 'popup')

    useEffect(() => {
        if (currentCursor === recordId && wasClick) {
            setWasClick(false)
            showPopup()
        } else if (currentCursor !== previousCursor && wasClick) {
            setWasClick(false)
        }
    }, [
        currentCursor,
        previousCursor,
        dispatch,
        fieldName,
        internalWidget?.bcName,
        internalWidget?.name,
        recordId,
        wasClick,
        widgetName,
        mode,
        bcName,
        showPopup
    ])

    return handleFileIconClick
}
