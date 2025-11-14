import { createKeyMirror } from '@utils/createKeyMirror'
import { CalendarOption } from '@interfaces/widget'
import i18n from 'i18next'

export type ToolbarSize = 'small' | 'large' | 'default'

export const CALENDAR_GRID_VIEWS = ['dayGridMonth', 'dayGridYear', 'timeGridDay', 'timeGridWeek', 'multiMonthYear'] as const

export const CALENDAR_GRID = createKeyMirror(CALENDAR_GRID_VIEWS)

export type CalendarGridViews = ValueOf<typeof CALENDAR_GRID>

export const CALENDAR_GRID_CUSTOM_VIEWS = ['multiMonthYearStack'] as const

export const CALENDAR_CUSTOM_GRID = createKeyMirror(CALENDAR_GRID_CUSTOM_VIEWS)

export type CalendarCustomGridViews = ValueOf<typeof CALENDAR_CUSTOM_GRID>

const EVENT_BASE_REFINERS = ['extendedProps', 'start', 'end', 'date', 'allDay', 'id', 'groupId', 'title', 'url', 'interactive'] as const
const EVENT_CUSTOM_REFINERS = ['description', 'color'] as const
export const EVENT_ALL_REFINERS = [...EVENT_BASE_REFINERS, ...EVENT_CUSTOM_REFINERS] as const

export type EventAllRefinersKeys = (typeof EVENT_ALL_REFINERS)[number]
export type EventAllRefiners = Partial<Record<EventAllRefinersKeys, any>>

export const EVENT_ALL_REFINERS_DICTIONARY = createKeyMirror(EVENT_ALL_REFINERS)

export const DEFAULT_EVENT_FIELD_MAP = {
    [EVENT_ALL_REFINERS_DICTIONARY.title]: 'value'
} as const

export const mapRefinerKeyToFieldKey = (calendarWidgetOptions: CalendarOption | undefined) => {
    return {
        title: calendarWidgetOptions?.valueFieldKey ?? DEFAULT_EVENT_FIELD_MAP.title,
        description: calendarWidgetOptions?.descriptionFieldKey ?? EVENT_ALL_REFINERS_DICTIONARY.description,
        start: calendarWidgetOptions?.startFieldKey ?? EVENT_ALL_REFINERS_DICTIONARY.start,
        end: calendarWidgetOptions?.endFieldKey ?? EVENT_ALL_REFINERS_DICTIONARY.end
    }
}

export const getMonthViewList = () => [
    {
        value: CALENDAR_GRID.dayGridMonth,
        title: i18n.t('Month')
    },
    {
        value: CALENDAR_GRID.timeGridWeek,
        title: i18n.t('Week')
    },
    {
        value: CALENDAR_GRID.timeGridDay,
        title: i18n.t('Day')
    }
]

export const getYearViewList = () => [
    {
        value: CALENDAR_GRID.multiMonthYear,
        title: i18n.t('Grid')
    },
    {
        value: CALENDAR_CUSTOM_GRID.multiMonthYearStack,
        title: i18n.t('Stack')
    },
    {
        value: CALENDAR_GRID.dayGridYear,
        title: i18n.t('Continuous')
    }
]

export const normalizeView = (view: CalendarGridViews | CalendarCustomGridViews) => {
    return view === CALENDAR_CUSTOM_GRID.multiMonthYearStack ? CALENDAR_GRID.multiMonthYear : view
}
