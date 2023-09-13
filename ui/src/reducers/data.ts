import { reducers } from '@cxbox-ui/core'
import { createReducer } from '@reduxjs/toolkit'

/**
 * Your initial state for this slice
 */
const initialState = {}

export const dataReducer = createReducer(initialState, reducers.createDataReducerBuilderManager(initialState).builder)
