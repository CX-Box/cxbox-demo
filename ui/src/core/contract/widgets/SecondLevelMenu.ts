import { WidgetOptions, WidgetMeta } from './common'
import { ListFieldMeta } from '../fields'

export interface SecondLevelMenuWidgetMeta extends WidgetMeta {
    type: 'SecondLevelMenu'
    fields: ListFieldMeta[]
    options: WidgetOptions
}

export function isWidgetSecondLevelMenu(meta: WidgetMeta): meta is SecondLevelMenuWidgetMeta {
    return meta.type === 'SecondLevelMenu'
}
