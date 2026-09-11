import { PendingValidationFailsFormat, reducers, ViewState as CoreViewState } from '@cxbox-ui/core'
import { AnyAction, createReducer, isAnyOf } from '@reduxjs/toolkit'
import { actions, partialUpdateRecordForm, resetRecordForm, setBcCount, setRecordForm } from '@actions'
import { PopupData } from '@interfaces/view'
import { RowMeta } from '@interfaces/rowMeta'
import { RequestErrorInfo, toRequestErrorInfo } from '@utils/requestErrorInfo'

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
            options?: Record<string, unknown>
        }
    }
    popupData?: PopupData
    /**
     * Details of the last failed API request, shown in ErrorPopup "Details" (cleared together with the error)
     */
    lastRequestError: RequestErrorInfo | null
    groups?: {
        widgetNames: string[]
        collapsedCondition?: {
            default?: boolean
        }
    }[]
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
    recordForm: {},
    lastRequestError: null
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
    // addMatcher: the core builder already has addCase handlers for these actions, a second addCase is not allowed
    .addMatcher(isAnyOf(actions.apiError), (state, action) => {
        state.lastRequestError = toRequestErrorInfo(action.payload.error)
    })
    .addMatcher(isAnyOf(actions.closeViewError), state => {
        state.lastRequestError = null
    })
    .addMatcher(isAnyOf(actions.showViewPopup, actions.showFileViewerPopup, actions.showWsNotificationPopup), (state, action) => {
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
