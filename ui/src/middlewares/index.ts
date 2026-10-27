import { resetBlankValuesMiddleware } from './resetBlankValuesMiddleware'
import { internalFormWidgetMiddleware } from './internalFormWidgetMiddleware'
import { groupingHierarchyMiddleware } from './groupingHierarchyMiddleware'
import { saveFormMiddleware } from './autosaveMiddleware'
import { massOperationMiddleware } from './massOperationMiddleware'
import { dropActionsForMissingBcMiddleware } from './dropActionsForMissingBcMiddleware'

export const middlewares = {
    resetBlankValuesMiddleware,
    internalFormWidgetMiddleware,
    massOperationMiddleware,
    groupingHierarchyMiddleware,
    autosave: saveFormMiddleware,
    // the last one: it also checks an action that another middleware passes on later, after the unsaved changes dialog
    dropActionsForMissingBcMiddleware
}
