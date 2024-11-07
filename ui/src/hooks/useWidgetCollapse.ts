import { useAppSelector } from '@store'

export const useWidgetCollapse = (widgetName: string) => {
    const viewName = useAppSelector(state => state.view.name)
    const widgetNameGroup =
        useAppSelector(state => state.view.groups?.find(item => item.widgetNames.includes(widgetName)))?.widgetNames || []
    const isCollapsed = useAppSelector(state => state.screen.collapsedWidgets[viewName]?.find(item => item === widgetName))

    const isMainWidget = widgetNameGroup[0] === widgetName

    return {
        viewName,
        widgetNameGroup,
        isMainWidget,
        isCollapsed
    }
}
