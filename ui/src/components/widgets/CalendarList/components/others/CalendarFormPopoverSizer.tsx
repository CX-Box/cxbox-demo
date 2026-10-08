import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import usePopupWidth from '@components/Popup/hooks/usePopupWidth'

type SetCalendarFormPopoverWidth = (calendarName: string, width: number | undefined) => void

const CalendarFormPopoverWidthsContext = React.createContext<Record<string, number>>({})
const SetCalendarFormPopoverWidthContext = React.createContext<SetCalendarFormPopoverWidth>(() => undefined)

/**
 * Keeps the widths of the calendar edit form popovers measured by CalendarFormPopoverSizer in the layout
 */
export function CalendarFormPopoverWidthProvider({ children }: { children: React.ReactNode }) {
    const [widths, setWidths] = useState<Record<string, number>>({})

    const setWidth = useCallback<SetCalendarFormPopoverWidth>((calendarName, width) => {
        setWidths(currentWidths => {
            if (currentWidths[calendarName] === width) {
                return currentWidths
            }

            const { [calendarName]: removedWidth, ...otherWidths } = currentWidths

            return width === undefined ? otherWidths : { ...otherWidths, [calendarName]: width }
        })
    }, [])

    return (
        <SetCalendarFormPopoverWidthContext.Provider value={setWidth}>
            <CalendarFormPopoverWidthsContext.Provider value={widths}>{children}</CalendarFormPopoverWidthsContext.Provider>
        </SetCalendarFormPopoverWidthContext.Provider>
    )
}

/**
 * Width of the edit form popover of the calendar; undefined when the edit widget has no place in the layout, the popover keeps its own width then
 */
export const useCalendarFormPopoverWidth = (calendarName: string): number | undefined => {
    return useContext(CalendarFormPopoverWidthsContext)[calendarName]
}

interface CalendarFormPopoverSizerProps {
    /**
     * Calendar widget which edit form popover gets the width
     */
    calendarName: string
}

/**
 * An empty block in place of the edit widget in the layout, measured like a popup (usePopupWidth):
 * the edit form popover of a calendar gets the same width as a popup with the same gridWidth
 */
function CalendarFormPopoverSizer({ calendarName }: CalendarFormPopoverSizerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const width = usePopupWidth(ref)
    const setWidth = useContext(SetCalendarFormPopoverWidthContext)

    useEffect(() => {
        // before the block is measured the hook returns the default popup width (a string)
        if (typeof width === 'number') {
            setWidth(calendarName, width)
        }
    }, [calendarName, setWidth, width])

    useEffect(() => {
        return () => setWidth(calendarName, undefined)
    }, [calendarName, setWidth])

    return <div ref={ref} />
}

export default React.memo(CalendarFormPopoverSizer)
