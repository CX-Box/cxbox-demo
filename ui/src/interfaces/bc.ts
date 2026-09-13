import { BcMeta as CoreBcMeta, FilterGroup as CoreFilterGroup } from '@cxbox-ui/core'

export interface FilterGroup extends CoreFilterGroup {
    defaultFilter?: boolean
}

export interface BcMeta extends CoreBcMeta {
    filterGroups?: FilterGroup[]
}
