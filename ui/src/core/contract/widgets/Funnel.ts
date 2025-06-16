import { WidgetOptions, WidgetMeta } from './common'
import { FieldMeta } from '../fields'

interface FunnelMetaOptions extends WidgetOptions {
    funnelOptions: { dataKey: string }
}

export interface FunnelWidgetMeta extends WidgetMeta {
    type: 'Funnel'
    fields: FieldMeta[]
    options: FunnelMetaOptions
}

export function isWidgetFunnel(meta: WidgetMeta): meta is FunnelWidgetMeta {
    return meta.type === 'Funnel'
}
