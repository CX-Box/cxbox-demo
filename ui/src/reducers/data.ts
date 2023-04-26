import { AnyAction } from '../interfaces/actions'
import { AppState } from '../interfaces/storeSlices'
import { DataState } from '@cxbox-ui/core/interfaces/data'

/**
 * Your initial state for this slice
 */
export const initialState: DataState = {}

export default function dataReducer(state: DataState = initialState, action: AnyAction, store?: Readonly<AppState>): DataState {
    switch (action.type) {
        /**
         * Your reducers for this slice
         */
        default:
            return state
    }
}
