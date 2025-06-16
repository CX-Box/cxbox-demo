import { WidgetMeta } from './common'
import { ListFieldMeta } from '../fields'
import { ListWidgetOptions } from './common/options.ts'

interface WidgetOptions extends ListWidgetOptions {
    groupingHierarchy?: {
        fields: string[]
    }
}

export interface GroupingHierarchyWidgetMeta extends WidgetMeta {
    type: 'GroupingHierarchy'
    fields: ListFieldMeta[]
    options: WidgetOptions
}

export function isWidgetGroupingHierarchy(meta: WidgetMeta): meta is GroupingHierarchyWidgetMeta {
    return meta.type === 'GroupingHierarchy'
}
