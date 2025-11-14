import React, { ChangeEvent, useCallback, useEffect, useRef, useState, useImperativeHandle, useMemo } from 'react'
import { AppWidgetMeta } from '@interfaces/widget'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import multiMonthPlugin from '@fullcalendar/multimonth'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import styles from './CalendarYear.less'
import { useAppSelector } from '@store'
import { selectBc, selectBcData, selectBcFilters, selectBcMetaInProgress } from '@selectors/selectors'
import CalendarToolbar from '@components/widgets/CalendarList/CalendarToolbar'
import CalendarEvent from '@components/widgets/CalendarList/CalendarEvent'
import { CustomContentGenerator, DateInput, EventContentArg } from '@fullcalendar/core'
import {
    CALENDAR_CUSTOM_GRID,
    CALENDAR_GRID,
    CalendarCustomGridViews,
    CalendarGridViews,
    getYearViewList,
    mapRefinerKeyToFieldKey,
    normalizeView,
    ToolbarSize
} from '@components/widgets/CalendarList/interfaces'
import { useFilterControls } from '@hooks/useFilterControls'
import { isSameFilter } from '@utils/calendar'
import { createYearEndFilter, createYearStartFilter, extractIntersectionDateRangeFromFilters } from '@components/widgets/CalendarList/utils'
import { getAverageDate, isCalendarYearGridRangeValid, yearChanged } from '@utils/date'
import { BcFilter, DataItem } from '@cxbox-ui/core'
import { useFieldDrilldown } from '@hooks/useFieldDrilldown'
import { useEventDataTransform } from '@components/widgets/CalendarList/hooks'
import { useCleanOldRangeFilters } from '@hooks/useCleanOldRangeFilters'
import { isDefined } from '@utils/isDefined'
import Calendar from '@components/widgets/CalendarList/Calendar'
import { actions, resetRecordForm, setRecordForm } from '@actions'
import { ConfigProvider, Spin } from 'antd'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import InnerForm from '@components/widgets/CalendarList/InnerForm'
import RowOperationsButton from '@components/widgets/CalendarList/RowOperations/RowOperationsButton'
import { useInternalWidget } from '@hooks/useInternalWidgetSelector'
import { useDispatch } from 'react-redux'
import UniquePopoverHoverAndClick, { UniquePopoverHoverAndClickProps } from '@components/widgets/CalendarList/UniquePopoverHoverAndClick'
import { useViewHeight } from '@components/widgets/CalendarList/hooks/useViewHeight'

interface CalendarYearProps {
    meta: AppWidgetMeta
    toggleButton?: React.ReactNode
}

export type CalendarYearApiHandle = {
    navigateToDateByFilter: () => void
}

const TOOLBAR_GROUP_ITEM_SIZE: ToolbarSize = 'default'

const EVENT_TIME_FORMAT = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
} as React.ComponentProps<typeof FullCalendar>['eventTimeFormat']

const CalendarYear = React.forwardRef<CalendarYearApiHandle, CalendarYearProps>(({ meta, toggleButton }, ref) => {
    const calendarRef = useRef<FullCalendar>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const bcData = useAppSelector(selectBcData(meta.bcName))
    const bcCursor = useAppSelector(selectBc(meta.bcName))?.cursor

    const [title, setTitle] = useState('')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<CalendarGridViews | CalendarCustomGridViews>(CALENDAR_GRID.multiMonthYear)
    const eventDataTransform = useEventDataTransform(meta)

    const filters = useAppSelector(selectBcFilters(meta.bcName))
    const { addFilter, forceUpdate } = useFilterControls(meta.bcName)
    const cleanOldRangeFilters = useCleanOldRangeFilters(meta.bcName)
    const height = useViewHeight()

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
                createYearStartFilter(refinerKeyToFieldKeyMapper.start, date),
                createYearEndFilter(refinerKeyToFieldKeyMapper.end, date)
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
            const validation = isCalendarYearGridRangeValid(startValue, endValue)

            if (validation.ok) {
                const newAvgDate = getAverageDate(startValue, endValue).toDate()
                if (yearChanged(currentDate, newAvgDate)) {
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

    const changeYear = useCallback(
        (newDate: Date) => {
            const api = calendarRef.current?.getApi()

            if (api) {
                const currentDate = api.getDate()

                if (yearChanged(currentDate, newDate)) {
                    api.gotoDate(newDate)
                    changeDateFilter(newDate)
                }
            }
        },
        [changeDateFilter]
    )

    const handleDateClick = useCallback(
        (info: { date: Date }) => {
            changeYear(info.date)
        },
        [changeYear]
    )

    const [multiMonthMaxColumns, setMultiMonthMaxColumns] = useState<number | undefined>()

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

    const changeView = useCallback((view: CalendarGridViews | CalendarCustomGridViews, date?: DateInput | null) => {
        const api = calendarRef.current?.getApi()

        if (api) {
            const dateToGo = date ?? api.getDate()
            api.changeView(normalizeView(view), dateToGo)
            setView(view)

            if (view === CALENDAR_CUSTOM_GRID.multiMonthYearStack) {
                setMultiMonthMaxColumns(1)
            } else {
                setMultiMonthMaxColumns(undefined)
            }
        }
    }, [])

    const handleViewChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            let newView = e.target.value as CalendarGridViews | CalendarCustomGridViews

            changeView(newView)
        },
        [changeView]
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
        changeYear(today)
    }, [changeYear])

    const { internalWidget, internalWidgetOperations, internalWidgetActiveCursor, internalWidgetStyle } = useInternalWidget(meta)
    const rowMetaInProgress = useAppSelector(selectBcMetaInProgress(internalWidget?.bcName))
    const dispatch = useDispatch()

    const { drilldown: handleDrillDownByTitle, fieldMeta: titleFieldMeta } = useFieldDrilldown(
        meta,
        mapRefinerKeyToFieldKey(meta.options?.calendar).title
    )

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

    const viewList = useMemo(() => getYearViewList(), [])

    return (
        <div ref={wrapperRef} className={styles.container}>
            <div className={styles.toolbarContainer}>
                <CalendarToolbar
                    mode="year"
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
                />
                {toggleButton}
            </div>
            <Calendar
                ref={calendarRef}
                multiMonthMaxColumns={multiMonthMaxColumns ?? 3}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin, listPlugin]}
                initialView={view}
                eventContent={renderEventContent}
                events={bcData}
                datesSet={handleDateSet}
                dateClick={handleDateClick}
                eventDataTransform={eventDataTransform}
                eventTimeFormat={EVENT_TIME_FORMAT}
                dayMaxEvents={false}
                multiMonthMinWidth={420}
                moreLinkContent={false}
                height={height - 30}
                eventClassNames={renderProps => (renderProps.event.id === bcCursor ? 'fc-active-event' : '')}
            />
        </div>
    )
})

export default React.memo(CalendarYear)
