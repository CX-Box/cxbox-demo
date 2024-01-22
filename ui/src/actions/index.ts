import { actions as coreActions } from '@cxbox-ui/core'
import * as customActions from './actions'

export * from './actions'

export const actions = {
    ...coreActions,
    ...customActions
}
