import { PendingValidationFailsFormat, reducers, ViewState as CoreViewState } from '@cxbox-ui/core'
import { AnyAction, createReducer, isAnyOf } from '@reduxjs/toolkit'
import { actions, partialUpdateRecordForm, resetRecordForm, setBcCount, setRecordForm, showViewPopup } from '@actions'
import { PopupData } from '@interfaces/view'
import { RowMeta } from '@interfaces/rowMeta'

interface ViewState extends Omit<CoreViewState, 'popupData'> {
    rowMeta: {
        [bcName: string]: {
            [bcUrl: string]: RowMeta
        }
    }
    bcRecordsCount: {
        [bcName: string]: {
            count: number
        }
    }
    recordForm: {
        [bcName: string]: {
            active: boolean
            widgetName: string
            bcName: string
            cursor: string
            create: boolean
        }
    }
    popupData?: PopupData
}

const initialState: ViewState = {
    ...reducers.initialViewState,
    pendingValidationFailsFormat: PendingValidationFailsFormat.target,
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
    recordForm: {}
}

const viewReducerBuilder = reducers
    .createViewReducerBuilderManager(initialState)
    .addCase(setBcCount, (state, action) => {
        const { bcName: bcCountName, count } = action.payload
        state.bcRecordsCount[bcCountName] = { count }
    })
    .addCase(setRecordForm, (state, action) => {
        state.recordForm[action.payload.bcName] = action.payload
    })
    .addCase(partialUpdateRecordForm, (state, action) => {
        state.recordForm[action.payload.bcName] = { ...state.recordForm[action.payload.bcName], ...action.payload }
    })
    .addMatcher(isAnyOf(showViewPopup, actions.showFileViewerPopup), (state, action) => {
        const { options, ...fileViewerPopupData } = action.payload
        state.popupData = { ...fileViewerPopupData, ...state.popupData, options }
    })
    .addMatcher(isAnyOf(actions.selectView, resetRecordForm), (state, action) => {
        const bcName = (action as AnyAction).payload?.bcName

        if (bcName) {
            delete state.recordForm[bcName]
        } else {
            state.recordForm = {}
        }
    }).builder

export const viewReducer = createReducer(initialState, viewReducerBuilder)
