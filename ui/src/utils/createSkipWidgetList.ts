import { AppWidgetMeta } from '@interfaces/widget'

export const createSkipWidgetList = <WidgetMeta extends AppWidgetMeta>(widgets: WidgetMeta[]) => {
    return Object.keys(
        widgets.reduce((acc: Record<string, any>, widget) => {
            const internalWidgets = [widget.options?.create?.widget, widget.options?.edit?.widget, widget.options?.read?.widget].filter(
                widgetName => typeof widgetName === 'string'
            ) as string[]

            internalWidgets.forEach(widgetName => {
                acc[widgetName] = widgetName
            })

            return acc
        }, {})
    )
}
