import { PopupWidgetTypes, utils, WidgetMeta } from '@cxbox-ui/core'
import { WidgetShowCondition } from '@cxbox-ui/schema'
import { AppWidgetMeta } from '@interfaces/widget'
import { RootState } from '@store'
import { isTreeCompatibleWidget, isTreeWidget } from '@constants/widget'

/**
 * Checks whether a widget is currently visible on the screen based on popup status and showCondition.
 */
export const isWidgetVisible = (widget: WidgetMeta | AppWidgetMeta | undefined, state: RootState): boolean => {
    if (!widget) {
        return false
    }

    const popupData = state.view.popupData
    const isPopup = PopupWidgetTypes.includes(widget.type)

    const legacyPopupCheck = popupData?.bcName === widget.bcName
    const newPopupCheck = popupData?.widgetName ? popupData.widgetName === widget.name : legacyPopupCheck
    let widgetVisibility = isPopup ? newPopupCheck : true

    const showConditionBcName = widget.showCondition?.bcName as string
    const cursor = state.screen.bo?.bc?.[showConditionBcName]?.cursor || ''
    const data = state.data[showConditionBcName]
    const pendingDataChanges = state.view.pendingDataChanges

    if (!utils.checkShowCondition(widget.showCondition as WidgetShowCondition, cursor, data, pendingDataChanges)) {
        widgetVisibility = false
    }

    return widgetVisibility
}

export const hasVisibleTreeWidget = (bcName: string, widgets: (WidgetMeta | AppWidgetMeta)[] | undefined, state: RootState): boolean => {
    return (widgets ?? []).some(widget => widget.bcName === bcName && isTreeWidget(widget) && isWidgetVisible(widget, state))
}

export const hasVisibleWidgetIncompatibleWithTree = (
    bcName: string,
    widgets: (WidgetMeta | AppWidgetMeta)[] | undefined,
    state: RootState
): boolean => {
    return (widgets ?? []).some(widget => widget.bcName === bcName && !isTreeCompatibleWidget(widget) && isWidgetVisible(widget, state))
}

export const getVisibleTreeWidgets = <T extends WidgetMeta | AppWidgetMeta>(
    bcName: string,
    widgets: T[] | undefined,
    state: RootState
): T[] => {
    return (widgets ?? []).filter(widget => widget.bcName === bcName && isTreeWidget(widget) && isWidgetVisible(widget, state))
}

export const getVisibleWidgetIncompatibleWithTree = <T extends WidgetMeta | AppWidgetMeta>(
    bcName: string,
    widgets: T[] | undefined,
    state: RootState
): T[] => {
    return (widgets ?? []).filter(widget => widget.bcName === bcName && !isTreeCompatibleWidget(widget) && isWidgetVisible(widget, state))
}

export interface TreeIncompatibleConflict {
    bcName: string
    treeWidgets: (WidgetMeta | AppWidgetMeta)[]
    incompatibleWidgets: (WidgetMeta | AppWidgetMeta)[]
}

/**
 * Scans all BCs on the view and finds all conflicts where a tree widget and an incompatible widget are visible simultaneously.
 */
export const findTreeIncompatibleConflicts = (
    widgets: (WidgetMeta | AppWidgetMeta)[] | undefined,
    state: RootState
): TreeIncompatibleConflict[] => {
    if (!widgets || widgets.length === 0) {
        return []
    }

    const bcNames = [...new Set(widgets.map(w => w.bcName).filter(Boolean))]
    const conflicts: TreeIncompatibleConflict[] = []

    bcNames.forEach(bcName => {
        const visibleTreeWidgets = getVisibleTreeWidgets(bcName, widgets, state)
        if (visibleTreeWidgets.length === 0) {
            return
        }

        const visibleIncompatibleWidgets = getVisibleWidgetIncompatibleWithTree(bcName, widgets, state)
        if (visibleIncompatibleWidgets.length > 0) {
            conflicts.push({
                bcName,
                treeWidgets: visibleTreeWidgets,
                incompatibleWidgets: visibleIncompatibleWidgets
            })
        }
    })

    return conflicts
}

export const formatTreeIncompatibleErrorMessage = (widget: WidgetMeta): string => {
    return `Tree widget cannot be used simultaneously with ${widget.name} (${widget.type})`
}
