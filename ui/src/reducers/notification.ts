import { actionTypes, AnyAction } from '../interfaces/actions'
import { AppState } from '../interfaces/storeSlices'
import { NotificationState } from '../interfaces/notification'

/**
 * Your initial state for this slice
 */
export const initialState: NotificationState = {
    page: 1,
    limit: 5
}

export default function notificationReducer(
    state: NotificationState = initialState,
    action: AnyAction,
    store?: Readonly<AppState>
): NotificationState {
    switch (action.type) {
        case actionTypes.changeNotification:
            const newState = {
                ...state,
                ...action.payload
            }

            return {
                ...newState,
                page: newState.page ?? initialState.page,
                limit: newState.limit ?? initialState.limit
            }
        default:
            return state
    }
}
