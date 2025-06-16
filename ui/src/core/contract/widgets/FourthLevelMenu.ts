import { WidgetMeta } from './common'
import { FieldMeta } from '../fields'

export interface FourthLevelMenuWidgetMeta extends WidgetMeta {
    type: 'FourthLevelMenu'
    fields: FieldMeta[]
}

export function isWidgetFourthLevelMenu(meta: WidgetMeta): meta is FourthLevelMenuWidgetMeta {
    return meta.type === 'FourthLevelMenu'
}
