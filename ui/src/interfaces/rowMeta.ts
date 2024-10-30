import { RowMeta as CoreRowMeta, RowMetaField as CoreRowMetaField } from '@cxbox-ui/core'
import { EmptyNodeLevel } from '@components/widgets/Table/groupingHierarchy'

export interface RowMetaField extends CoreRowMetaField {
    fileAccept?: string
    /**
     * TODO: move to core
     */
    sortable?: boolean
    defaultGroupingHierarchy?: {
        groupByFields: { name: string; options: null }[]
        levels: EmptyNodeLevel[]
    }
}

export interface RowMeta extends CoreRowMeta {
    fields: RowMetaField[]
}
