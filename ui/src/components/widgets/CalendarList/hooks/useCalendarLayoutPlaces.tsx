import React, { useCallback, useMemo } from 'react'
import { Col } from 'antd'
import { AppWidgetMeta } from '@interfaces/widget'
import CalendarCreatePopup from '@components/widgets/CalendarList/components/others/CalendarCreatePopup'
import CalendarFormPopoverSizer from '@components/widgets/CalendarList/components/others/CalendarFormPopoverSizer'
import { getCalendarCreatePopupOwners, getCalendarEditPopoverOwners } from '@components/widgets/CalendarList/utils/calendarFormPopups'

/**
 * Places of the calendar forms in the view layout.
 * Create and edit widgets of a calendar are internal, but take a place like popup widgets (own row, width by gridWidth):
 * the create popup is rendered there, the width of the edit popover is measured there.
 */
export const useCalendarLayoutPlaces = (widgets: AppWidgetMeta[]) => {
    const createPopupOwners = useMemo(() => getCalendarCreatePopupOwners(widgets), [widgets])
    const editPopoverOwners = useMemo(() => getCalendarEditPopoverOwners(widgets), [widgets])

    /**
     * Internal widgets which still take a place in the layout
     */
    const widgetNames = useMemo(() => Object.keys({ ...createPopupOwners, ...editPopoverOwners }), [createPopupOwners, editPopoverOwners])

    /**
     * Column of the layout in place of the create or edit widget of a calendar, null for other widgets
     */
    const renderPlace = useCallback(
        (widget: AppWidgetMeta, key: React.Key) => {
            const createPopupOwner = createPopupOwners[widget.name]
            const editPopoverOwner = editPopoverOwners[widget.name]

            if (!createPopupOwner && !editPopoverOwner) {
                return null
            }

            return (
                <Col key={key} span={widget.gridWidth}>
                    {createPopupOwner && <CalendarCreatePopup meta={createPopupOwner} />}
                    {editPopoverOwner && <CalendarFormPopoverSizer calendarName={editPopoverOwner.name} />}
                </Col>
            )
        },
        [createPopupOwners, editPopoverOwners]
    )

    return { widgetNames, renderPlace }
}
