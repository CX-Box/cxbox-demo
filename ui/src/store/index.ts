import { AnyAction, configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../reducers'
import { CXBoxEpic } from '@cxbox-ui/core/interfaces'
import { CxBoxApiInstance } from '../api'
import { createEpicMiddleware } from 'redux-observable'
import { rootEpic } from '../epics'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootState>({
    dependencies: {
        api: CxBoxApiInstance
    }
})
export const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(epicMiddleware)
})

epicMiddleware.run(rootEpic)

export type RootState = ReturnType<typeof rootReducer>

export type RootEpic = CXBoxEpic<RootState, typeof CxBoxApiInstance>

export type AppDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch: () => AppDispatch = useDispatch
