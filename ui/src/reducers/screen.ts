import { AnyAction, actionTypes } from '../interfaces/actions'
import { AppState, ScreenState } from '../interfaces/storeSlices'

/**
 * Your initial state for this slice
 */
export const initialState: ScreenState = {
    menuCollapsed: false,
    screenName: '',
    bo: {
        activeBcName: '',
        bc: {}
    },
    views: [],
    primaryView: '',
    cachedBc: {},
    filters: {},
    sorters: {}
}

export default function screenReducer(state: ScreenState = initialState, action: AnyAction, store?: Readonly<AppState>): ScreenState {
    switch (action.type) {
        case actionTypes.changeMenuCollapsed: {
            return {
                ...state,
                menuCollapsed: action.payload
            }
        }
        /**
         * Your reducers for this slice
         */

        /**
         * An example reducer for custom action
         */
        case actionTypes.customAction: {
            return state
        }
        default:
            return state
    }
}
