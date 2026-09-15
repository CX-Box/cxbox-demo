import { RefObject, useLayoutEffect, useState } from 'react'
import { LAYOUT_GRID_COLUMNS, LAYOUT_ROW_GUTTER } from '@constants/layout'

/**
 * Width of the edit form popover of a calendar: the width of a layout column with the gridWidth of the edit widget,
 * the same as the create popup gets in place of the create widget (DashboardLayout)
 */
export const useCalendarFormPopoverWidth = (calendarRef: RefObject<HTMLElement>, gridWidth: number | undefined) => {
    const [rowWidth, setRowWidth] = useState(0)

    useLayoutEffect(() => {
        const layoutRow = calendarRef.current?.closest('.ant-row')

        if (!layoutRow) {
            return
        }

        const update = () => setRowWidth(layoutRow.clientWidth)
        const resizeObserver = new ResizeObserver(update)

        update()
        resizeObserver.observe(layoutRow)

        return () => {
            resizeObserver.disconnect()
        }
    }, [calendarRef])

    return gridWidth && rowWidth ? Math.round((rowWidth * gridWidth) / LAYOUT_GRID_COLUMNS) - LAYOUT_ROW_GUTTER : undefined
}
