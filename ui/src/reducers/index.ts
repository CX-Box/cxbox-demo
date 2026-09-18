import { screenReducer } from './screen'
import { dataReducer } from './data'
import { viewReducer } from './view'
import { sessionReducer } from './session'
import { routerReducer } from './router'
import { combineReducers } from '@reduxjs/toolkit'
import { notificationReducer } from './notification'
import { treeReducer } from '../slices/tree'
import { aiExtractReducer } from '@features/aiExtract'

export const rootReducer = combineReducers({
    screen: screenReducer,
    data: dataReducer,
    view: viewReducer,
    session: sessionReducer,
    router: routerReducer,
    notification: notificationReducer,
    tree: treeReducer,
    aiExtract: aiExtractReducer
})
