import { actionTypes, AnyAction } from '../interfaces/actions'
import { AppState } from '../interfaces/storeSlices'
import { ViewState } from '@cxbox-ui/core/interfaces/view'

export type CustomView = ViewState & {
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
    bcRecordsCount: {},
    recordForm: {
        active: false,
        create: false,
        widgetName: '',
        bcName: ``,
        cursor: ''
    }
}

export default function viewReducer(state: CustomView = initialState, action: AnyAction, store?: Readonly<AppState>): CustomView {
    switch (action.type) {
        /**
         * Your reducers for this slice
         */

        case actionTypes.setBcCount: {
            const { bcName: bcCountName, count } = action.payload

            return {
                ...state,
                bcRecordsCount: {
                    ...state.bcRecordsCount,
                    [bcCountName]: { count }
                }
            }
        }

        case actionTypes.setRecordForm: {
            return {
                ...state,
                recordForm: {
                    ...action.payload
                }
            }
        }

        case actionTypes.partialUpdateRecordForm: {
            return {
                ...state,
                recordForm: {
                    ...state.recordForm,
                    ...action.payload
                }
            }
        }

        case actionTypes.selectView:
        case actionTypes.resetRecordForm: {
            return {
                ...state,
                recordForm: {
                    ...initialState.recordForm
                }
            }
        }

        default:
            return state
    }
}
