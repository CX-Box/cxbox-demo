import React, { useCallback } from 'react'
import { EventContentArg } from '@fullcalendar/core'
import TruncatedText from '@components/ui/TruncatedText/TruncatedText'
import DrillDown from '@components/ui/DrillDown/DrillDown'
import { WidgetField } from '@interfaces/widget'
import cn from 'classnames'
import styles from './CalendarEvent.less'

interface CalendarEventProps extends EventContentArg {
    onDrillDown?: (recordId: string) => void
    drillDownFieldMeta: WidgetField | undefined
    widgetName: string
    onlyText?: boolean
}

const CalendarEvent: React.FC<CalendarEventProps> = ({ widgetName, drillDownFieldMeta, onDrillDown, onlyText, ...arg }) => {
    const bgColor = arg.backgroundColor
    const borderColor = arg.borderColor
    const textColor = arg.textColor

    const handleDrillDown = useCallback(() => {
        onDrillDown?.(arg.event.id)
    }, [arg.event.id, onDrillDown])

    return (
        <TruncatedText className={cn(styles.calendarEvent, 'fc-event-main-frame')} style={{ color: textColor }} inline={true} mode="wrap">
            {!onlyText && (
                <span
                    className="fc-daygrid-event-dot"
                    aria-hidden="true"
                    style={{
                        borderColor: borderColor || bgColor,
                        backgroundColor: bgColor
                    }}
                />
            )}
            {arg.timeText && !onlyText ? (
                <span className="fc-event-time" aria-hidden="true">
                    {arg.timeText}
                </span>
            ) : null}
            <span
                className="fc-event-title"
                data-test="FIELD"
                data-test-field-type={drillDownFieldMeta?.type}
                data-test-field-title={drillDownFieldMeta?.title}
                data-test-field-key={drillDownFieldMeta?.key}
            >
                {onDrillDown ? (
                    <DrillDown
                        meta={drillDownFieldMeta}
                        widgetName={widgetName}
                        cursor={arg.event.id}
                        onDrillDown={handleDrillDown}
                        drillDownComponent={
                            <span className={styles.actionLink} data-test-field-drilldown={true} onClick={handleDrillDown}>
                                {arg.event.title}
                            </span>
                        }
                    />
                ) : (
                    arg.event.title
                )}
            </span>
        </TruncatedText>
    )
}

export default React.memo(CalendarEvent)
