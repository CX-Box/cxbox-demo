import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle } from 'react'
import { AppWidgetMeta } from '@interfaces/widget'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import styles from './CalendarMonth.less'
import { useAppSelector } from '@store'
import { selectBc, selectBcData, selectBcFilters, selectBcMetaInProgress } from '@selectors/selectors'
import CalendarToolbar from '@components/widgets/CalendarList/CalendarToolbar'
import CalendarEvent from '@components/widgets/CalendarList/CalendarEvent'
import { CustomContentGenerator, DateInput, EventContentArg, MoreLinkContentArg } from '@fullcalendar/core'
import InnerForm from '@components/widgets/CalendarList/InnerForm'
import { useInternalWidget } from '@hooks/useInternalWidgetSelector'
import { ConfigProvider, Spin } from 'antd'
import { useDispatch } from 'react-redux'
import { actions, resetRecordForm, setRecordForm } from '@actions'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import {
    CALENDAR_GRID,
    CalendarGridViews,
    getMonthViewList,
    mapRefinerKeyToFieldKey,
    ToolbarSize
} from '@components/widgets/CalendarList/interfaces'
import { useFilterControls } from '@hooks/useFilterControls'
import { isSameFilter } from '@utils/calendar'
import {
    createMonthEndFilter,
    createMonthStartFilter,
    extractIntersectionDateRangeFromFilters
} from '@components/widgets/CalendarList/utils'
import { dayChanged, getAverageDate, isCalendarMonthGridRangeValid, monthChanged, toYMD } from '@utils/date'
import { BcFilter, DataItem } from '@cxbox-ui/core'
import { useFieldDrilldown } from '@hooks/useFieldDrilldown'
import RowOperationsButton from '@components/widgets/CalendarList/RowOperations/RowOperationsButton'
import { MoreLink } from './MoreLink'
import { useEventDataTransform } from '@components/widgets/CalendarList/hooks'
import { useCleanOldRangeFilters } from '@hooks/useCleanOldRangeFilters'
import { isDefined } from '@utils/isDefined'
import Calendar from '@components/widgets/CalendarList/Calendar'
import UniquePopoverHoverAndClick, { UniquePopoverHoverAndClickProps } from '@components/widgets/CalendarList/UniquePopoverHoverAndClick'

interface CalendarMonthProps {
    meta: AppWidgetMeta
    toggleButton?: React.ReactNode
}

export type CalendarMonthApiHandle = {
    navigateToDateByFilter: () => void
}

const TOOLBAR_GROUP_ITEM_SIZE: ToolbarSize = 'default'

const CALENDAR_GRID_VIEW_SETTINGS: Partial<Record<CalendarGridViews, { dayMaxEvents?: number }>> = {
    [CALENDAR_GRID.dayGridMonth]: {
        dayMaxEvents: 5
    }
}

const EVENT_TIME_FORMAT = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
} as React.ComponentProps<typeof FullCalendar>['eventTimeFormat']

const CalendarMonth = React.forwardRef<CalendarMonthApiHandle, CalendarMonthProps>(({ meta, toggleButton }, ref) => {
    const calendarRef = useRef<FullCalendar>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const bcData = useAppSelector(selectBcData(meta.bcName))
    const bcCursor = useAppSelector(selectBc(meta.bcName))?.cursor

    const [title, setTitle] = useState('')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<CalendarGridViews>(CALENDAR_GRID.dayGridMonth)
    const [activeDate, setActiveDate] = useState<Date | null>(null)
    const eventDataTransform = useEventDataTransform(meta)
    const isMonthView = view === CALENDAR_GRID.dayGridMonth

    const filters = useAppSelector(selectBcFilters(meta.bcName))
    const { addFilter, forceUpdate } = useFilterControls(meta.bcName)
    const cleanOldRangeFilters = useCleanOldRangeFilters(meta.bcName)

    const hasNewFilters = useCallback(
        (newFilters: BcFilter[]) => {
            return newFilters.some(newFilter => !filters?.length || !filters.some(filter => isSameFilter(filter, newFilter)))
        },
        [filters]
    )

    const changeDateFilter = useCallback(
        (date: Date) => {
            const refinerKeyToFieldKeyMapper = mapRefinerKeyToFieldKey(meta?.options?.calendar)
            const [startFilter, endFilter] = [
                createMonthStartFilter(refinerKeyToFieldKeyMapper.start, date),
                createMonthEndFilter(refinerKeyToFieldKeyMapper.end, date)
            ]

            if (hasNewFilters([startFilter, endFilter])) {
                cleanOldRangeFilters(startFilter)
                cleanOldRangeFilters(endFilter)

                addFilter(startFilter)
                addFilter(endFilter)

                forceUpdate()
            }
        },
        [meta?.options?.calendar, hasNewFilters, cleanOldRangeFilters, addFilter, forceUpdate]
    )

    const navigateToDateByFilter = useCallback(() => {
        if (!calendarRef.current) {
            return
        }

        const api = calendarRef.current.getApi()
        const currentDate = api.getDate()

        const refinerKeys = mapRefinerKeyToFieldKey(meta?.options?.calendar)
        const [endValue, startValue] = filters ? extractIntersectionDateRangeFromFilters(filters, refinerKeys) : [undefined, undefined]

        if (isDefined(startValue) && isDefined(endValue)) {
            const validation = isCalendarMonthGridRangeValid(startValue, endValue)

            if (validation.ok) {
                const newAvgDate = getAverageDate(startValue, endValue).toDate()
                if (monthChanged(currentDate, newAvgDate)) {
                    api.gotoDate(newAvgDate)
                }
            } else {
                changeDateFilter(currentDate)
            }
        } else {
            changeDateFilter(currentDate)
        }
    }, [changeDateFilter, filters, meta?.options?.calendar])

    const changeDate = useCallback(
        (date: Date) => {
            const api = calendarRef.current?.getApi()

            if (api) {
                api.gotoDate(date)
                changeDateFilter(date)
            }
        },
        [changeDateFilter]
    )

    const changeMonth = useCallback(
        (newDate: Date) => {
            const api = calendarRef.current?.getApi()

            if (api) {
                const currentDate = api.getDate()

                if (monthChanged(currentDate, newDate)) {
                    api.gotoDate(newDate)
                    changeDateFilter(newDate)
                }
            }
        },
        [changeDateFilter]
    )

    const changeDay = useCallback(
        (newDate: Date) => {
            const api = calendarRef.current?.getApi()

            if (api) {
                const currentDate = api.getDate()

                if (dayChanged(currentDate, newDate)) {
                    api.gotoDate(newDate)

                    if (monthChanged(currentDate, newDate)) {
                        changeDateFilter(newDate)
                    }
                }
            }
        },
        [changeDateFilter]
    )

    const changeActiveDate = useCallback((newDate: Date, options: { toggle: boolean } = { toggle: false }) => {
        if (options.toggle) {
            setActiveDate(prevActiveDate => {
                return prevActiveDate?.toDateString() === newDate?.toDateString() ? null : newDate
            })
        } else {
            setActiveDate(newDate)
        }
    }, [])

    const handleDateClick = useCallback(
        (info: { date: Date }) => {
            changeMonth(info.date)
            changeActiveDate(info.date, { toggle: true })
        },
        [changeActiveDate, changeMonth]
    )

    // Setting the class name of the active day
    const dayCellClassNames = useCallback(
        (arg: { date: Date; view: any }) => {
            if (!activeDate) {
                return []
            }

            return toYMD(arg.date) === toYMD(activeDate) ? ['fc-day-active'] : []
        },
        [activeDate]
    )

    const handleDateSet = useCallback(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi()
            setTitle(api.view.title)
            setCurrentDate(api.getDate())
        }
    }, [setCurrentDate])

    // Header initialization
    useEffect(() => {
        handleDateSet()
    }, [handleDateSet])

    const changeView = useCallback((view: CalendarGridViews, date?: DateInput | null) => {
        const api = calendarRef.current?.getApi()

        if (api) {
            const dateToGo = date ?? api.getDate()
            api.changeView(view, dateToGo)
            setView(view)
        }
    }, [])

    const handleViewChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            changeView(e.target.value as CalendarGridViews, activeDate)
        },
        [activeDate, changeView]
    )

    const handlePrevButton = useCallback(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi()
            api.prev()
            changeDateFilter(api.getDate())
        }
    }, [changeDateFilter])

    const handleNextButton = useCallback(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi()
            api.next()
            changeDateFilter(api.getDate())
        }
    }, [changeDateFilter])

    const handleTodayButton = useCallback(() => {
        const today = new Date()
        changeDay(today)
        changeActiveDate(today, { toggle: false })
    }, [changeActiveDate, changeDay])

    const createNavLinkHandler = useCallback(
        (view: CalendarGridViews) => (date: Date) => {
            changeMonth(date)
            changeActiveDate(date, { toggle: false })
            changeView(view, date)
        },
        [changeActiveDate, changeView, changeMonth]
    )

    const handleNavLinkDayClick = useMemo(() => createNavLinkHandler(CALENDAR_GRID.timeGridDay), [createNavLinkHandler])
    const handleNavLinkWeekClick = useMemo(() => createNavLinkHandler(CALENDAR_GRID.timeGridWeek), [createNavLinkHandler])

    const { internalWidget, internalWidgetOperations, internalWidgetActiveCursor, internalWidgetStyle } = useInternalWidget(meta)
    const rowMetaInProgress = useAppSelector(selectBcMetaInProgress(internalWidget?.bcName))
    const dispatch = useDispatch()

    const { drilldown: handleDrillDownByTitle, fieldMeta: titleFieldMeta } = useFieldDrilldown(
        meta,
        mapRefinerKeyToFieldKey(meta.options?.calendar).title
    )

    const renderMoreLinkContent: CustomContentGenerator<MoreLinkContentArg> = useCallback(arg => {
        return <MoreLink {...arg} />
    }, [])

    const [activePopoverUid, setActivePopoverUid] = useState<string | null>(null)

    const isActiveRecord = useCallback((uid: string | undefined) => activePopoverUid === uid, [activePopoverUid])

    const toggleRecordForm = useCallback(
        (toggle: boolean, record: DataItem) => {
            if (toggle) {
                dispatch(
                    setRecordForm({
                        widgetName: meta.name,
                        cursor: record.id,
                        bcName: meta.bcName,
                        active: true,
                        create: false
                    })
                )
            } else {
                dispatch(resetRecordForm({ bcName: meta.bcName }))
            }
        },
        [dispatch, meta.bcName, meta.name]
    )

    const renderEventContent: CustomContentGenerator<EventContentArg> = useCallback(
        arg => {
            const isLoading = (internalWidget && arg.event.id !== internalWidgetActiveCursor) || rowMetaInProgress
            const isInlineForm = isDefined(internalWidget) && internalWidgetStyle === 'inlineForm'
            const withoutInlineForm = !isInlineForm

            const handleSelectRecord = () => {
                if (arg.event.id !== internalWidgetActiveCursor) {
                    dispatch(actions.bcSelectRecord({ bcName: meta.bcName, cursor: arg.event.id }))
                }
            }

            const getPopupContainer = (triggerNode: HTMLElement) => triggerNode.parentElement as HTMLElement

            const hoverContent = (
                <ConfigProvider getPopupContainer={getPopupContainer}>
                    <RowOperationsButton widget={meta} onClick={handleSelectRecord} />
                </ConfigProvider>
            )

            const clickContent = isInlineForm ? (
                <ConfigProvider getPopupContainer={getPopupContainer}>
                    <DebugWidgetWrapper meta={internalWidget}>
                        <Spin spinning={isLoading}>
                            <InnerForm
                                widgetMeta={internalWidget}
                                operations={internalWidgetOperations}
                                additionalOperations={<RowOperationsButton widget={meta} />}
                            />
                        </Spin>
                    </DebugWidgetWrapper>
                </ConfigProvider>
            ) : undefined

            const handleVisibleChange: UniquePopoverHoverAndClickProps['onVisibleChange'] = (toggle, uid, triggerType) => {
                if (isInlineForm && triggerType === 'click') {
                    toggleRecordForm(toggle, arg.event.extendedProps)
                }
                setActivePopoverUid(toggle ? uid : null)
            }

            return (
                <UniquePopoverHoverAndClick
                    visible={isActiveRecord}
                    onVisibleChange={handleVisibleChange}
                    placement="rightTop"
                    contentHover={hoverContent}
                    contentClick={clickContent}
                    overlayClassNameHover={styles.operationsPopover}
                    overlayClassNameClick={styles.formPopover}
                >
                    <div className={styles.calendarContainer} onClick={withoutInlineForm ? handleSelectRecord : undefined}>
                        <CalendarEvent
                            widgetName={meta.name}
                            drillDownFieldMeta={titleFieldMeta}
                            onDrillDown={handleDrillDownByTitle}
                            {...arg}
                        />
                    </div>
                </UniquePopoverHoverAndClick>
            )
        },
        [
            dispatch,
            handleDrillDownByTitle,
            internalWidget,
            internalWidgetActiveCursor,
            internalWidgetOperations,
            internalWidgetStyle,
            isActiveRecord,
            meta,
            rowMetaInProgress,
            titleFieldMeta,
            toggleRecordForm
        ]
    )

    useImperativeHandle(
        ref,
        () => ({
            navigateToDateByFilter
        }),
        [navigateToDateByFilter]
    )

    const viewList = useMemo(() => getMonthViewList(), [])

    return (
        <div ref={wrapperRef} className={styles.container}>
            <div className={styles.toolbarContainer}>
                <CalendarToolbar
                    title={title}
                    currentDate={currentDate}
                    onDateChange={changeDate}
                    view={view}
                    size={TOOLBAR_GROUP_ITEM_SIZE}
                    onPrev={handlePrevButton}
                    onNext={handleNextButton}
                    onToday={handleTodayButton}
                    onViewChange={handleViewChange}
                    viewList={viewList}
                    disableFilter={!isMonthView}
                />
                {toggleButton}
            </div>
            <Calendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView={view}
                droppable={true}
                dayMaxEvents={CALENDAR_GRID_VIEW_SETTINGS[view]?.dayMaxEvents}
                eventContent={renderEventContent}
                events={bcData}
                datesSet={handleDateSet}
                dateClick={handleDateClick}
                dayCellClassNames={dayCellClassNames}
                eventDataTransform={eventDataTransform}
                eventTimeFormat={EVENT_TIME_FORMAT}
                navLinks={true}
                navLinkDayClick={handleNavLinkDayClick}
                navLinkWeekClick={handleNavLinkWeekClick}
                moreLinkContent={renderMoreLinkContent}
                moreLinkClick={view} // whatever popover calls
                eventClassNames={renderProps => (renderProps.event.id === bcCursor ? 'fc-active-event' : '')}
                autoHeight={true}
            />
        </div>
    )
})

export default React.memo(CalendarMonth)
