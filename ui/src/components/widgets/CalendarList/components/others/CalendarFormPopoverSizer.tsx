import React, { useEffect, useRef } from 'react'
import usePopupWidth from '@components/Popup/hooks/usePopupWidth'

/**
 * Widths of the edit form popovers of the calendars, keyed by the calendar widget name
 */
export const CalendarFormPopoverWidthContext = React.createContext<Record<string, number>>({})

interface CalendarFormPopoverSizerProps {
    /**
     * Calendar widget which edit form popover gets the width
     */
    calendarName: string
    onWidthChange: (calendarName: string, width: number) => void
}

/**
 * An empty block in the place of the edit widget in the layout, measured like a popup (usePopupWidth):
 * the edit form popover of a calendar gets the same width as the create popup with the same gridWidth
 */
function CalendarFormPopoverSizer({ calendarName, onWidthChange }: CalendarFormPopoverSizerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const width = usePopupWidth(ref)

    useEffect(() => {
        // before the block is measured the hook returns the default popup width (a string), the popover keeps its own width then
        if (typeof width === 'number') {
            onWidthChange(calendarName, width)
        }
    }, [calendarName, onWidthChange, width])

    return <div ref={ref} />
}

export default React.memo(CalendarFormPopoverSizer)
