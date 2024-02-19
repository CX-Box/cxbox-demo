import { interfaces } from '@cxbox-ui/core'

export interface FilterGroup extends interfaces.FilterGroup {
    name: string
    filters: string
    id?: string
    personal?: boolean
    bc?: string
}
