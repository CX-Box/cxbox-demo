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
        case actionTypes.sendOperationSuccess:
        case actionTypes.bcSaveDataSuccess: {
            if (action.payload.dataItem == null) {
                return state
            }

            const newCursor = action.payload.dataItem.id

            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            loading: false,
                            /**
                             * Here we support id change on save action to support platform usage as other microservices data provider. I
                             * In this case new record is usually virtually created with temporary id, then on 'save' record is saved to real microservice and temporary id is replaced with new permanent one
                             */
                            cursor: newCursor
                        }
                    }
                },
                cachedBc: {
                    ...state.cachedBc,
                    [action.payload.bcName]: `${action.payload.bcName}/${newCursor}`
                }
            }
        }
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
