import { screenReducer } from './screen'
import { dataReducer } from './data'
import { viewReducer } from './view'
import { sessionReducer } from './session'
import routerReducer from './router'
import { combineReducers } from '@reduxjs/toolkit'

export const rootReducer = combineReducers({
    screen: screenReducer,
    data: dataReducer,
    view: viewReducer,
    session: sessionReducer
    // router: routerReducer
})
