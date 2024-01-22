import { actions, interfaces, reducers } from '@cxbox-ui/core'
import { AnyAction, createReducer, isAnyOf } from '@reduxjs/toolkit'
import { partialUpdateRecordForm, resetRecordForm, setBcCount, setRecordForm, showViewPopup } from '@actions'

interface ViewState extends interfaces.ViewState {
    bcRecordsCount: {
        [bcName: string]: {
            count: number
        }
    }
    recordForm: {
        active: boolean
        widgetName: string
        bcName: string
        cursor: string
        create: boolean
    }
    popupData?: interfaces.PopupData & {
        options?: {
            operation?: AnyAction['type']
        }
    }
}

const initialState: ViewState = {
    ...reducers.initialViewState,
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
    bcRecordsCount: {},
    recordForm: {
        active: false,
        create: false,
        widgetName: '',
        bcName: ``,
        cursor: ''
    }
}

const viewReducerBuilder = reducers
    .createViewReducerBuilderManager(initialState)
    .addCase(setBcCount, (state, action) => {
        const { bcName: bcCountName, count } = action.payload
        state.bcRecordsCount[bcCountName] = { count }
    })
    .addCase(setRecordForm, (state, action) => {
        state.recordForm = action.payload
    })
    .addCase(partialUpdateRecordForm, (state, action) => {
        state.recordForm = { ...state.recordForm, ...action.payload }
    })
    .addMatcher(isAnyOf(showViewPopup), (state, action) => {
        const { options } = action.payload
        state.popupData = { ...state.popupData, options }
    })
    .addMatcher(isAnyOf(actions.selectView, resetRecordForm), state => {
        state.recordForm = { ...initialState.recordForm }
    }).builder

export const viewReducer = createReducer(initialState, viewReducerBuilder)
