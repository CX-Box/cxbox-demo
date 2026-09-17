import { useAppSelector } from '@store'
import { selectWidget } from '@selectors/selectors'
import { isWidgetVisible } from '@utils/widgetVisibility'

export const useWidgetVisibility = (widgetName: string | undefined) => {
    return useAppSelector(state => {
        const widget = selectWidget(state, widgetName)

        return isWidgetVisible(widget, state)
    })
}
