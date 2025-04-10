import { AppWidgetMeta } from '@interfaces/widget'
import { EMPTY_ARRAY } from '@constants'

export const getInternalWidgets = <WidgetMeta extends AppWidgetMeta>(widgets: WidgetMeta[]) => {
    return widgets.flatMap(widget => {
        return Array.from(
            new Set(
                [
                    widget.options?.create?.widget,
                    widget.options?.edit?.widget,
                    widget.options?.read?.widget,
                    ...(widget.options?.dual2D?.widgets ?? EMPTY_ARRAY)
                ].filter(widgetName => typeof widgetName === 'string') as string[]
            )
        )
    }, {})
}
