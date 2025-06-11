import { createDefaultSort } from '@utils/groupingHierarchy'
import { BcMeta, WidgetListField } from '@cxbox-ui/core'
import { AppWidgetMeta, CustomWidgetTypes, DualAxes2DWidgetMeta } from '@interfaces/widget'
import { SessionScreen } from '@interfaces/session'
import { addUidToTree } from '@components/ViewNavigation/tab/standard/utils/addUidToTree'

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
        const dictionary: { [bcName: string]: { widget?: AppWidgetMeta; bc?: BcMeta } | undefined } = {}

        newScreen?.meta?.views?.forEach(view => {
            view.widgets.forEach(widget => {
                if (widget.type === CustomWidgetTypes.DualAxes2D) {
                    combineDualAxes2DFields(widget as DualAxes2DWidgetMeta, view.widgets)
                }

                const dictionaryItem = dictionary[widget.bcName]

                if (!dictionaryItem && widget.options?.groupingHierarchy?.fields?.length) {
                    dictionary[widget.bcName] = { widget }
                }
            })
        })

        Object.keys(dictionary).forEach(bcNameWithGrouping => {
            const screenBcList = newScreen?.meta?.bo.bc
            const bcIndexWithGrouping = screenBcList?.findIndex(bc => bc.name === bcNameWithGrouping)
            const bcWithGrouping = screenBcList && typeof bcIndexWithGrouping === 'number' ? screenBcList[bcIndexWithGrouping] : undefined
            const widgetWithGrouping = dictionary[bcNameWithGrouping]?.widget

            if (bcWithGrouping && screenBcList && widgetWithGrouping) {
                bcWithGrouping.defaultSort = createDefaultSort(widgetWithGrouping, bcWithGrouping) ?? bcWithGrouping.defaultSort
            }
        })

        newScreen.meta?.navigation?.menu?.forEach(addUidToTree)
    })

    return screens
}
