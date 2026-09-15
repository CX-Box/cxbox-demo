import React, { useCallback, useMemo, useState } from 'react'
import { Row, Col } from 'antd'
import Widget from '@components/Widget/Widget'
import { createSkipWidgetList } from '@utils/createSkipWidgetList'
import { groupByRow } from '@utils/layout'
import { LAYOUT_GRID_COLUMNS, LAYOUT_ROW_GUTTER, popupWidgets, sidebarWidgetsTypes } from '@constants/layout'
import { CustomWidgetDescriptor, WidgetTypes } from '@cxbox-ui/core'
import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import CalendarCreatePopup from '@components/widgets/CalendarList/components/others/CalendarCreatePopup'
import CalendarFormPopoverSizer, {
    CalendarFormPopoverWidthContext
} from '@components/widgets/CalendarList/components/others/CalendarFormPopoverSizer'
import { getCalendarCreatePopupOwners, getCalendarEditPopoverOwners } from '@components/widgets/CalendarList/utils/calendarCreatePopup'
import styles from './DashboardLayout.less'

export interface DashboardLayoutProps {
    widgets: AppWidgetMeta[]
    customWidgets?: Record<string, CustomWidgetDescriptor>
    skipWidgetTypes?: string[]
    customSpinner?: (props: any) => React.ReactElement<any>
    card?: (props: any) => React.ReactElement<any>
}

export function DashboardLayout(props: DashboardLayoutProps) {
    // calendar create widgets are internal, but their popup takes a place in the layout like popup widgets
    const calendarCreatePopupOwners = useMemo(() => getCalendarCreatePopupOwners(props.widgets), [props.widgets])
    // calendar edit widgets get a place in the layout too: the width of their popover is measured there like of a popup
    const calendarEditPopoverOwners = useMemo(() => getCalendarEditPopoverOwners(props.widgets), [props.widgets])
    const [calendarFormPopoverWidths, setCalendarFormPopoverWidths] = useState<Record<string, number>>({})

    const handleCalendarFormPopoverWidthChange = useCallback((calendarName: string, width: number) => {
        setCalendarFormPopoverWidths(widths => (widths[calendarName] === width ? widths : { ...widths, [calendarName]: width }))
    }, [])

    const widgetsByRow = React.useMemo(() => {
        return groupByRow(props.widgets, props.skipWidgetTypes || [], [
            ...Object.keys(calendarCreatePopupOwners),
            ...Object.keys(calendarEditPopoverOwners)
        ])
    }, [props.widgets, props.skipWidgetTypes, calendarCreatePopupOwners, calendarEditPopoverOwners])

    const additionalInfoWidgets = useMemo(() => {
        const skipWidgetList = createSkipWidgetList(props.widgets)

        return props.widgets.filter(widget => sidebarWidgetsTypes.includes(widget.type) && !skipWidgetList.includes(widget.name))
    }, [props.widgets])

    const filePreviewWidget = useMemo(() => {
        return props.widgets.find(widget => widget.type === CustomWidgetTypes.FilePreview)
    }, [props.widgets])

    const CommonWidgets = Object.values(widgetsByRow).map((row, rowIndex) => (
        <Row key={rowIndex} gutter={[LAYOUT_ROW_GUTTER, 0]}>
            {row.map((widget, colIndex) => {
                const calendarCreatePopupOwner = calendarCreatePopupOwners[widget.name]
                const calendarEditPopoverOwner = calendarEditPopoverOwners[widget.name]
                const isCalendarFormPlace = !!calendarCreatePopupOwner || !!calendarEditPopoverOwner
                const widgetCol = (
                    <Col key={colIndex} span={widget.gridWidth}>
                        {isCalendarFormPlace ? (
                            <>
                                {calendarCreatePopupOwner && <CalendarCreatePopup meta={calendarCreatePopupOwner} />}
                                {calendarEditPopoverOwner && (
                                    <CalendarFormPopoverSizer
                                        calendarName={calendarEditPopoverOwner.name}
                                        onWidthChange={handleCalendarFormPopoverWidthChange}
                                    />
                                )}
                            </>
                        ) : (
                            <Widget
                                meta={widget}
                                card={props.card}
                                customWidgets={props.customWidgets}
                                customSpinner={props.customSpinner}
                            />
                        )}
                    </Col>
                )

                return popupWidgets.includes(widget.type as WidgetTypes) || isCalendarFormPlace ? (
                    <Col key={colIndex} span={LAYOUT_GRID_COLUMNS}>
                        <Row gutter={[LAYOUT_ROW_GUTTER, 0]}>{widgetCol}</Row>
                    </Col>
                ) : (
                    widgetCol
                )
            })}
        </Row>
    ))

    const ProcessedCommonWidgets = filePreviewWidget ? (
        <Row gutter={24}>
            <Col span={12}>{CommonWidgets}</Col>
            <Col span={12}>
                <Widget meta={filePreviewWidget} customWidgets={props.customWidgets} customSpinner={props.customSpinner} />
            </Col>
        </Row>
    ) : (
        CommonWidgets
    )

    if (additionalInfoWidgets.length !== 0) {
        return (
            <CalendarFormPopoverWidthContext.Provider value={calendarFormPopoverWidths}>
                <Row gutter={24}>
                    <Col span={18}>{ProcessedCommonWidgets}</Col>
                    <Col span={6} className={styles.additionalInfoContainer}>
                        {additionalInfoWidgets.map(widget => (
                            <Row key={widget.name} gutter={[8, 8]}>
                                <Col span={24}>
                                    <Widget meta={widget} customWidgets={props.customWidgets} customSpinner={props.customSpinner} />
                                </Col>
                            </Row>
                        ))}
                    </Col>
                </Row>
            </CalendarFormPopoverWidthContext.Provider>
        )
    }

    return (
        <CalendarFormPopoverWidthContext.Provider value={calendarFormPopoverWidths}>
            {ProcessedCommonWidgets}
        </CalendarFormPopoverWidthContext.Provider>
    )
}

export default React.memo(DashboardLayout)
