import screenReducer, { initialState as screenInitialState } from './screen'
import dataReducer, { initialState as dataInitialState } from './data'
import viewReducer, { initialState as viewInitialState } from './view'
import sessionReducer, { initialState as sessionInitialState } from './session'
import routerReducer, { initialState as routerInitialState } from './router'
import { RootReducer } from '../interfaces/store'
import { AppReducers } from '../interfaces/storeSlices'

export const reducers: RootReducer<AppReducers, any> = {
    screen: {
        initialState: screenInitialState,
        reducer: screenReducer
    },
    data: {
        initialState: dataInitialState,
        reducer: dataReducer
    },
    view: {
        initialState: viewInitialState,
        reducer: viewReducer
    },
    session: {
        initialState: sessionInitialState,
        reducer: sessionReducer
    },
    router: {
        initialState: routerInitialState,
        reducer: routerReducer
    }
}
