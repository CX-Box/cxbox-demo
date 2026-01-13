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
    const [wasClick, setWasClick] = useState(false)

    const handleFileIconClick = useCallback(() => {
        setWasClick(true)
    }, [])

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

            dispatch(
                actions.showFileViewerPopup({
                    active: true,
                    options: {
                        bcName,
                        type: 'file-viewer',
                        calleeFieldKey: fieldName,
                        mode
                    },
                    calleeWidgetName: widgetName as string
                })
            )
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
        bcName
    ])

    return handleFileIconClick
}
