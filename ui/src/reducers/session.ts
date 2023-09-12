import { actionTypes, AnyAction } from '../interfaces/actions'
import { AppState } from '../interfaces/storeSlices'
import { Session } from '@cxbox-ui/core/interfaces/session'

export type CustomSession = Session & {
    logout: boolean
    isMetaRefreshing: boolean
}

/**
 * Your initial state for this slice
 */
export const initialState: CustomSession = {
    active: false,
    screens: [],
    loginSpin: false,
    logout: false,
    isMetaRefreshing: false
}

export default function sessionReducer(state: CustomSession = initialState, action: AnyAction, store?: Readonly<AppState>): CustomSession {
    switch (action.type) {
        /**
         * Your reducers for this slice
         */
        case actionTypes.logout: {
            return {
                ...state,
                loginSpin: false,
                active: false,
                logout: true
            }
        }
        case actionTypes.loginDone: {
            return {
                ...state,
                active: true,
                logout: false
            }
        }
        case actionTypes.refreshMeta: {
            return {
                ...state,
                isMetaRefreshing: true
            }
        }
        case actionTypes.refreshMetaDone:
        case actionTypes.refreshMetaFail: {
            return {
                ...state,
                isMetaRefreshing: false
            }
        }
        default:
            return state
    }
}
