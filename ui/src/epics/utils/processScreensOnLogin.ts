import { createDefaultSort } from '@utils/groupingHierarchy'
import { BcMeta, WidgetListField } from '@cxbox-ui/core'
import { AppWidgetMeta, CustomWidgetTypes, DualAxes2DWidgetMeta } from '@interfaces/widget'
import { SessionScreen } from '@interfaces/session'
import { addUidToTree } from '@components/ViewNavigation/tab/standard/utils/addUidToTree'
import { createDefaultFilter } from '@utils/calendar'
import { isCalendarWidget } from '@constants/widget'

const combineDualAxes2DFields = (dualAxes2DWidget: DualAxes2DWidgetMeta, viewWidgets: AppWidgetMeta[]) => {
    const uniqueFields: Map<string, WidgetListField> = new Map()
    const dualAxes2DFields = dualAxes2DWidget.fields as WidgetListField[]
    dualAxes2DFields.forEach(field => uniqueFields.set(field.key, field))

    const optionsDual2DWidgets = dualAxes2DWidget.options?.dual2D?.widgets
    optionsDual2DWidgets?.forEach(name => {
        const optionsDual2DWidgetFields = viewWidgets?.find(item => item.name === name)?.fields as WidgetListField[]

        optionsDual2DWidgetFields?.forEach(field => {
            if (!uniqueFields.has(field.key)) {
                uniqueFields.set(field.key, field)
            }
        })
    })

    dualAxes2DWidget.fields = Array.from(uniqueFields.values())
}

// add sort for groupHierarchies mutate, combine DualAxes2D fields, add uid for navigation
export const processScreensOnLogin = (screens: SessionScreen[]) => {
    screens.forEach(newScreen => {
        const groupingHierarchyBcDictionary: { [bcName: string]: { widget?: AppWidgetMeta; bc?: BcMeta } | undefined } = {}
        const calendarBcDictionary: { [bcName: string]: { widget?: AppWidgetMeta; bc?: BcMeta } | undefined } = {}

        newScreen?.meta?.views?.forEach(view => {
            view.widgets.forEach(widget => {
                if (widget.type === CustomWidgetTypes.DualAxes2D) {
                    combineDualAxes2DFields(widget as DualAxes2DWidgetMeta, view.widgets)
                }

                if (!groupingHierarchyBcDictionary[widget.bcName] && widget.options?.groupingHierarchy?.fields?.length) {
                    groupingHierarchyBcDictionary[widget.bcName] = { widget }
                }
                if (isCalendarWidget(widget)) {
                    const existingEntry = calendarBcDictionary[widget.bcName]
                    const shouldOverwrite =
                        existingEntry?.widget?.type === CustomWidgetTypes.CalendarList && widget.type === CustomWidgetTypes.CalendarYearList

                    if (!existingEntry || shouldOverwrite) {
                        calendarBcDictionary[widget.bcName] = { widget }
                    }
                }
            })
        })

        Object.keys(groupingHierarchyBcDictionary).forEach(currentBcName => {
            const screenBcList = newScreen?.meta?.bo.bc
            const bcIndexWithGrouping = screenBcList?.findIndex(bc => bc.name === currentBcName)
            const bcWithGrouping = screenBcList && typeof bcIndexWithGrouping === 'number' ? screenBcList[bcIndexWithGrouping] : undefined
            const widgetWithGrouping = groupingHierarchyBcDictionary[currentBcName]?.widget

            if (bcWithGrouping && screenBcList && widgetWithGrouping) {
                bcWithGrouping.defaultSort = createDefaultSort(widgetWithGrouping, bcWithGrouping)
            }
        })

        Object.keys(calendarBcDictionary).forEach(currentBcName => {
            const screenBcList = newScreen?.meta?.bo.bc
            const bcIndex = screenBcList?.findIndex(bc => bc.name === currentBcName)
            const bcWithCalendar = screenBcList && typeof bcIndex === 'number' ? screenBcList[bcIndex] : undefined
            const calendarWidget = calendarBcDictionary[currentBcName]?.widget

            if (bcWithCalendar && screenBcList && calendarWidget) {
                bcWithCalendar.defaultFilter = createDefaultFilter(calendarWidget, bcWithCalendar)
                bcWithCalendar.cursorSelectionStrategy = 'closestDate'
            }
        })

        // test substitution
        if (['client'].includes(newScreen.name)) {
            for (const aView of newScreen.meta?.views || []) {
                if (['clientview'].includes(aView.name)) {
                    for (const aWidget of aView.widgets) {
                        if (['clientView'].includes(aWidget.name)) {
                            for (const aField of (aWidget.fields[0] as any).fields as any[]) {
                                if (aField.key === 'brief') {
                                    aField.preview = {
                                        ...aField.preview,
                                        enabled: true,
                                        mode: 'inline'
                                    }
                                }
                            }
                        }

                        if (['clientViewAdditionalInfo'].includes(aWidget.name)) {
                            ;(aWidget.options as any).layout.rows[1].cols[0].fieldKey = 'brief'
                            for (const aField of aWidget.fields as any[]) {
                                if (aField.key === 'address') {
                                    aField.label = 'Brief'
                                    aField.key = 'brief'
                                    aField.type = 'fileUpload'
                                    aField.fileIdKey = 'briefId'
                                    aField.preview = {
                                        ...aField.preview,
                                        enabled: true,
                                        mode: 'inline'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        newScreen.meta?.navigation?.menu?.forEach(addUidToTree)
    })

    return screens
}
