import { ScreenState as CxboxScreenState } from '@cxbox-ui/core/interfaces/screen'
import { Store } from '@cxbox-ui/core/interfaces/store'
import { DataState } from '@cxbox-ui/core/interfaces/data'
import { CustomSession } from '../reducers/session'
import { CustomView } from '../reducers/view'

/**
 * You can change typings or add new store slices here
 */
export interface AppReducers extends Partial<Store> {
    screen: ScreenState
    data: DataState
    view: CustomView
    session: CustomSession
}

export type AppState = Store & AppReducers

export interface ScreenState extends CxboxScreenState {
    menuCollapsed: boolean
}
