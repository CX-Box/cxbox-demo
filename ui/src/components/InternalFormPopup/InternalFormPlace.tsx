import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Col } from 'antd'
import { WidgetTypes } from '@cxbox-ui/core'
import { AppWidgetMeta } from '@interfaces/widget'
import usePopupWidth from '@components/Popup/hooks/usePopupWidth'
import InternalFormPopup from './InternalFormPopup'

type SetInternalFormWidth = (formName: string, width: number | undefined) => void

const InternalFormWidthsContext = React.createContext<Record<string, number>>({})
const SetInternalFormWidthContext = React.createContext<SetInternalFormWidth>(() => undefined)

/**
 * Keeps the widths of the places of create and edit forms in the layout
 */
export function InternalFormWidthProvider({ children }: { children: React.ReactNode }) {
    const [widths, setWidths] = useState<Record<string, number>>({})

    const setWidth = useCallback<SetInternalFormWidth>((formName, width) => {
        setWidths(currentWidths => {
            if (currentWidths[formName] === width) {
                return currentWidths
            }

            const { [formName]: removedWidth, ...otherWidths } = currentWidths

            return width === undefined ? otherWidths : { ...otherWidths, [formName]: width }
        })
    }, [])

    return (
        <SetInternalFormWidthContext.Provider value={setWidth}>
            <InternalFormWidthsContext.Provider value={widths}>{children}</InternalFormWidthsContext.Provider>
        </SetInternalFormWidthContext.Provider>
    )
}

/**
 * Width of the place of the form in the layout, the same as of a popup with the gridWidth of the form.
 * Undefined when the form has no place in the layout.
 */
export const useInternalFormWidth = (formName: string | undefined): number | undefined => {
    const widths = useContext(InternalFormWidthsContext)

    return formName ? widths[formName] : undefined
}

interface InternalFormPlaceProps {
    /**
     * Form widget of options.create or options.edit
     */
    widget: AppWidgetMeta
    /**
     * Widget which options refer to the form
     */
    owner: AppWidgetMeta
}

/**
 * Place of a create or edit form in the layout, a column of its gridWidth like for popup widgets.
 * The popup of the form is drawn here. The width of the place is measured for the widget which shows the form itself (the edit popover of a calendar).
 */
function InternalFormPlace({ widget, owner }: InternalFormPlaceProps) {
    const ref = useRef<HTMLDivElement>(null)
    const width = usePopupWidth(ref)
    const setWidth = useContext(SetInternalFormWidthContext)

    useEffect(() => {
        if (widget.type !== WidgetTypes.Form) {
            console.error(`Widget "name": ${owner.name} has meta inspection warning!
Inspection Description: widget "${widget.name}" of options.create.widget or options.edit.widget must have type "Form"`)
        }
    }, [owner.name, widget.name, widget.type])

    useEffect(() => {
        // before the place is measured the hook returns the default popup width (a string)
        if (typeof width === 'number') {
            setWidth(widget.name, width)
        }
    }, [setWidth, widget.name, width])

    useEffect(() => {
        return () => setWidth(widget.name, undefined)
    }, [setWidth, widget.name])

    return (
        <Col span={widget.gridWidth}>
            <div ref={ref} />
            <InternalFormPopup widget={widget} owner={owner} />
        </Col>
    )
}

export default React.memo(InternalFormPlace)
