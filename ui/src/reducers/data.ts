import { actionTypes, AnyAction } from '../interfaces/actions'
import { AppState } from '../interfaces/storeSlices'
import { DataItem, DataState } from '@cxbox-ui/core/interfaces/data'

/**
 * Your initial state for this slice
 */
export const initialState: DataState = {}
const emptyData: DataItem[] = []

export default function dataReducer(state: DataState = initialState, action: AnyAction, store?: Readonly<AppState>): DataState {
    switch (action.type) {
        /**
         * To change the position of the created record.
         * The created record should appear at the beginning of the table.
         * TODO: Fix in the core and remove
         */
        case actionTypes.bcNewDataSuccess: {
            const oldData = state[action.payload.bcName]
            const newDataIndex = oldData.findIndex(dataItem => dataItem.vstamp === -1)
            let newData

            if (newDataIndex >= 0) {
                newData = [oldData[newDataIndex], ...(oldData || emptyData).slice(0, newDataIndex)]
            }

            return {
                ...state,
                [action.payload.bcName]: newData ?? state[action.payload.bcName]
            }
        }
        /**
         * Your reducers for this slice
         */

        default:
            return state
    }
}
