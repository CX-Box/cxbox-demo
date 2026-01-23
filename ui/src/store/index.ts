import { AnyAction, configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../reducers'
import { actions, interfaces, middlewares as coreMiddlewares, utils } from '@cxbox-ui/core'
import { CxBoxApiInstance } from '../api'
import { createEpicMiddleware } from 'redux-observable'
import { rootEpic } from '../epics'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { middlewares as ourMiddlewares } from '../middlewares'
import { catchError } from 'rxjs'
import { getInternalWidgets } from '@utils/getInternalWidgets'
import moment from 'moment'
import { mapRefinerKeyToFieldKey } from '@components/widgets/CalendarList/constants'
import { selectWidgetByCondition } from '@selectors/selectors'
import { isCalendarWidget } from '@constants/widget'
import { AppWidgetMeta, WidgetField } from '@interfaces/widget'
import { getEventTimeGranularity, isAllDayOrMultiDay } from '@components/widgets/CalendarList/utils'

const middlewares = Object.values({ ...coreMiddlewares, ...ourMiddlewares })

const cursorStrategyManager = new utils.CursorStrategyManager<RootState>()

const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootState>({
    dependencies: {
        api: CxBoxApiInstance,
        utils: { getInternalWidgets, cursorStrategyManager }
    }
})

export const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [actions.apiError.toString(), actions.httpError.toString(), actions.showViewError.toString()],
                ignoredPaths: ['view.error']
            }
        })
            .concat(middlewares)
            .concat(epicMiddleware)
})

epicMiddleware.run((action$, state$, dependencies) =>
    rootEpic(action$, state$, dependencies).pipe(
        catchError((error, source) => {
            console.error(error)
            return source
        })
    )
)

// Identifies redux state by indirect signs
export function isStateObject(arg: any): arg is RootState {
    const hasRequiredStoreProperties = (obj: object): obj is RootState => {
        const requiredProperties: Extract<keyof RootState, 'router' | 'screen' | 'view'>[] = ['router', 'screen', 'view']

        return requiredProperties.every(property => property in obj)
    }

    return typeof arg === 'object' && arg !== null && hasRequiredStoreProperties(arg)
}

export type RootState = ReturnType<typeof rootReducer>

export type RootEpic = interfaces.CXBoxEpic<RootState, typeof CxBoxApiInstance>

export type AppDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch: () => AppDispatch = useDispatch

cursorStrategyManager.register('closestDate', (data, prevCursor, bcName, state) => {
    if (data.some(i => i.id === prevCursor)) {
        return prevCursor
    }

    if (!data.length) {
        return null
    }

    const now = moment()
    // By default, we take the first element if no one has valid dates
    let closestId = data[0].id
    let minDiff = Infinity
    let isBestAllDay = false
    let bestStart: moment.Moment | null = null

    const widget = selectWidgetByCondition(state, widget => widget.bcName === bcName && isCalendarWidget(widget)) as
        | AppWidgetMeta
        | undefined
    const calendarOption = widget?.options?.calendar
    const refinerKeyToFieldKeyMapper = mapRefinerKeyToFieldKey(calendarOption)

    for (const dataItem of data) {
        const record = dataItem as Record<string, any>
        const start = moment(record[refinerKeyToFieldKeyMapper.start])
        const end = moment(record[refinerKeyToFieldKeyMapper.end])

        if (!start.isValid() || !end.isValid()) {
            continue
        }

        const granularity = widget?.type
            ? getEventTimeGranularity(
                  (widget?.fields as WidgetField[])
                      .filter(field => [refinerKeyToFieldKeyMapper.start, refinerKeyToFieldKeyMapper.end].includes(field.key))
                      .map(field => field.type)
              )
            : 'second'
        let diff: number
        if (now.isBetween(start, end, granularity, '[]')) {
            diff = 0
        } else if (now.isBefore(start)) {
            diff = Math.abs(now.diff(start))
        } else {
            diff = Math.abs(now.diff(end))
        }

        const isAllDay = isAllDayOrMultiDay([start, end], granularity)

        if (diff < minDiff) {
            minDiff = diff
            closestId = dataItem.id
            isBestAllDay = isAllDay
            bestStart = start
        } else if (diff === minDiff) {
            if (isAllDay && !isBestAllDay) {
                closestId = dataItem.id
                isBestAllDay = true
                bestStart = start
            } else if (isAllDay === isBestAllDay) {
                if (bestStart && start.isBefore(bestStart)) {
                    closestId = dataItem.id
                    bestStart = start
                }
            }
        }
    }

    return closestId
})
