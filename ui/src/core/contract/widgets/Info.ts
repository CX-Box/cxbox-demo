import { WidgetMeta } from './common'
import { FieldBlock, InfoFieldMeta } from '../fields'

export interface InfoWidgetMeta extends WidgetMeta {
    type: 'Info'
    fields: Array<FieldBlock<InfoFieldMeta> | InfoFieldMeta>
}

export function isWidgetInfo(meta: WidgetMeta): meta is InfoWidgetMeta {
    return meta.type === 'Info'
}
