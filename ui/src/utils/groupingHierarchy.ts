import { BcMeta, BcSorter, utils } from '@cxbox-ui/core'
import { AppWidgetMeta } from '@interfaces/widget'
import { WidgetFieldBase } from '@cxbox-ui/schema'
import { SessionScreen } from '@interfaces/session'

/**
 * String representation of default bc sorters
 *
 * "_sort.{order}.{direction}={fieldKey}&_sort.{order}.{direction}"
 *
 * i.e. "_sort.0.asc=firstName"
 * @param widget
 * @param bc
 */
const createDefaultSort = (widget: AppWidgetMeta, bc: BcMeta) => {
    const groupingHierarchyOption = widget.options?.groupingHierarchy

    if (groupingHierarchyOption?.fields.length) {
        const sortedGroupKeys =
            (widget.fields as WidgetFieldBase[])
                .filter(field => groupingHierarchyOption?.fields.includes(field.key))
                .map(field => field.key) ?? []

        const oldSorters = utils.parseSorters(bc.defaultSort) ?? []
        const newSorters: BcSorter[] = []

        // filters are created for grouping fields
        sortedGroupKeys.forEach(groupKey => {
            newSorters.push({ fieldName: groupKey, direction: 'asc' })
        })

        // merging old filters with new ones
        oldSorters.forEach(oldSorter => {
            const groupSortIndex = sortedGroupKeys.indexOf(oldSorter.fieldName)

            if (groupSortIndex !== -1) {
                newSorters[groupSortIndex] = oldSorter
            } else {
                newSorters.push(oldSorter)
            }
        })

        const sorterParams = utils.getSorters(newSorters)

        return sorterParams ? new URLSearchParams(sorterParams).toString() : bc.defaultSort
    }

    return bc.defaultSort
}

export const addSortForGroupHierarchiesMutate = (screens: SessionScreen[]) => {
    screens.forEach(newScreen => {
        const dictionary: { [bcName: string]: { widget?: AppWidgetMeta; bc?: BcMeta } | undefined } = {}

        newScreen?.meta?.views?.forEach(view => {
            view.widgets.forEach(widget => {
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
    })

    return screens
}

export const getGroupingHierarchyWidget = <T extends AppWidgetMeta>(widgets: T[], bcName: string) =>
    widgets.find(widget => widget.bcName === bcName && widget.type === 'GroupingHierarchy')

export const moveUnallocatedRowsToBeginning = <T extends Record<string, any>>(array?: T[], sortedGroupKeys: string[] = []) => {
    const unallocatedRows: T[] = []
    const otherRows: T[] = []

    array?.forEach(item => {
        const isUnallocatedRow = sortedGroupKeys.some(groupKey => !item[groupKey])

        if (isUnallocatedRow) {
            unallocatedRows.push(item)
            return
        }

        otherRows.push(item)
    })

    return [...unallocatedRows, ...otherRows]
}
