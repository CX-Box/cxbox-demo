import { resetBlankValuesMiddleware } from './resetBlankValuesMiddleware'
import { internalFormWidgetMiddleware } from './internalFormWidgetMiddleware'
import { groupingHierarchyMiddleware } from './groupingHierarchyMiddleware'
import { saveFormMiddleware } from './autosaveMiddleware'
import { massOperationMiddleware } from './massOperationMiddleware'

export const middlewares = {
    resetBlankValuesMiddleware,
    internalFormWidgetMiddleware,
    massOperationMiddleware,
    groupingHierarchyMiddleware,
    autosave: saveFormMiddleware
}
