import { CoreMiddlewares, CustomMiddleware, CustomMiddlewares } from '@cxbox-ui/core/interfaces/customMiddlewares'
import { internalFormWidgetMiddleware } from './internalFormWidgetMiddleware'

export const middlewares: CustomMiddlewares<Partial<CoreMiddlewares> & { internalFormWidgetMiddleware: CustomMiddleware }> = {
    internalFormWidgetMiddleware: {
        implementation: internalFormWidgetMiddleware,
        priority: 'AFTER'
    }
}
