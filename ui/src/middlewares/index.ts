import { resetBlankValuesMiddleware } from './resetBlankValuesMiddleware'
import { CoreMiddlewares, CustomMiddleware, CustomMiddlewares } from '@cxbox-ui/core/interfaces/customMiddlewares'
import { internalFormWidgetMiddleware } from './internalFormWidgetMiddleware'

export const middlewares: CustomMiddlewares<Partial<CoreMiddlewares> & Record<string, CustomMiddleware>> = {
    resetBlankValuesMiddleware: {
        implementation: resetBlankValuesMiddleware,
        priority: 'BEFORE'
    },
    internalFormWidgetMiddleware: {
        implementation: internalFormWidgetMiddleware,
        priority: 'AFTER'
    }
}
