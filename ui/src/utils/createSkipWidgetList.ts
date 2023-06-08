import { AppWidgetMeta } from '../interfaces/widget'

export const createSkipWidgetList = <WidgetMeta extends AppWidgetMeta>(widgets: WidgetMeta[]) => {
    return Object.keys(
        widgets.reduce((acc: Record<string, any>, widget) => {
            const internalWidgetToCreate = widget.options?.create?.widget

            if (typeof internalWidgetToCreate === 'string') {
                acc[internalWidgetToCreate] = internalWidgetToCreate
            }

            const internalWidgetToEdit = widget.options?.edit?.widget

            if (typeof internalWidgetToEdit === 'string') {
                acc[internalWidgetToEdit] = internalWidgetToEdit
            }

            return acc
        }, {})
    )
}
