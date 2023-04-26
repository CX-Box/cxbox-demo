import { AppState } from '../interfaces/storeSlices'
import { AnyAction } from './actions'

/**
 * Describes an application reducer
 *
 */
export type CustomReducer<ReducerState, State = AppState> = (
    state: ReducerState,
    action: AnyAction,
    store?: Readonly<State>
) => ReducerState

/**
 *
 */
export interface ReducerConfiguration<ReducerState, ClientActions> {
    initialState: ReducerState
    override?: boolean
    reducer: CustomReducer<ReducerState, ClientActions>
}

/**
 *
 */
export type RootReducer<ClientStore, ClientActions> = {
    [reducerSliceName in keyof ClientStore]: ReducerConfiguration<ClientStore[keyof ClientStore], ClientActions>
}
