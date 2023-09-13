import { reducers } from '@cxbox-ui/core'
import { createReducer } from '@reduxjs/toolkit'
import { setBcCount } from '../actions/types'
import { ViewState } from '@cxbox-ui/core/interfaces'

export type CustomView = ViewState & {
    bcRecordsCount: {
        [bcName: string]: {
            count: number
        }
    }
}

/**
 * Your initial state for this slice
 */
export const initialState: CustomView = {
    rowMeta: {},
    pendingDataChanges: {},
    id: -1,
    name: '',
    url: '',
    handledForceActive: {},
    metaInProgress: {},
    widgets: [],
    columns: null,
    rowHeight: null,
    readOnly: false,
    popupData: { bcName: '' },
    bcRecordsCount: {}
}

/**
 * Your reducers for this slice
 */
export const viewReducer = createReducer(
    initialState,
    reducers.createViewReducerBuilderManager(initialState).addCase(setBcCount, (state, action) => {
        const { bcName: bcCountName, count } = action.payload
        state.bcRecordsCount[bcCountName].count = count
    }).builder
)
