import { WidgetMeta } from './common'
import { FieldMeta } from '../fields'

export interface ThirdLevelMenuWidgetMeta extends WidgetMeta {
    type: 'SecondLevelMenu'
    fields: FieldMeta[]
}

export function isWidgetThirdLevelMenu(meta: WidgetMeta): meta is ThirdLevelMenuWidgetMeta {
    return meta.type === 'ThirdLevelMenu'
}
