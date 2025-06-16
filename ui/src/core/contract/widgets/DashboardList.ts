import { WidgetMeta } from './common'
import { ListFieldMeta } from '../fields'

export interface DashboardListWidgetMeta extends WidgetMeta {
    type: 'DashboardList'
    fields: ListFieldMeta[]
}

export function isWidgetDashboardList(meta: WidgetMeta): meta is DashboardListWidgetMeta {
    return meta.type === 'DashboardList'
}
