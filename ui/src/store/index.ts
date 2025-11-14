import { AnyAction, configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../reducers'
import { actions, interfaces, middlewares as coreMiddlewares } from '@cxbox-ui/core'
import { CxBoxApiInstance } from '../api'
import { createEpicMiddleware } from 'redux-observable'
import { rootEpic } from '../epics'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { middlewares as ourMiddlewares } from '../middlewares'
import { catchError } from 'rxjs'
import { getInternalWidgets } from '@utils/getInternalWidgets'

const middlewares = Object.values({ ...coreMiddlewares, ...ourMiddlewares })

const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootState>({
    dependencies: {
        api: CxBoxApiInstance,
        utils: { getInternalWidgets }
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
