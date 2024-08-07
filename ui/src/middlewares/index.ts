import { resetBlankValuesMiddleware } from './resetBlankValuesMiddleware'
import { internalFormWidgetMiddleware } from './internalFormWidgetMiddleware'
import { groupingHierarchyMiddleware } from './groupingHierarchyMiddleware'
import { saveFormMiddleware } from './autosaveMiddleware'

export const middlewares = {
    resetBlankValuesMiddleware,
    internalFormWidgetMiddleware,
    groupingHierarchyMiddleware,
    autosave: saveFormMiddleware
}
