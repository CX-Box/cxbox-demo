import { actionTypes, AnyAction } from '../interfaces/actions'
import { AppState } from '../interfaces/storeSlices'
import { ViewState } from '@cxbox-ui/core/interfaces/view'

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
        default:
            return state
    }
}
