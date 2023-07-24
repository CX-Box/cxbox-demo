import { resetBlankValuesMiddleware } from './resetBlankValuesMiddleware'
import { CoreMiddlewares, CustomMiddleware, CustomMiddlewares } from '@cxbox-ui/core/interfaces/customMiddlewares'

export const middlewares: CustomMiddlewares<Partial<CoreMiddlewares> & { resetBlankValuesMiddleware: CustomMiddleware }> = {
    resetBlankValuesMiddleware: {
        implementation: resetBlankValuesMiddleware,
        priority: 'BEFORE'
    }
}
