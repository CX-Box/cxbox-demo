import { RowMeta as CoreRowMeta, RowMetaField as CoreRowMetaField } from '@cxbox-ui/core'
import { EmptyNodesStructureNode } from '@components/widgets/Table/groupingHierarchy'

export interface RowMetaField extends CoreRowMetaField {
    fileAccept?: string
    /**
     * TODO: move to core
     */
    sortable?: boolean
    groupingHierarchyEmptyNodesStructure?: EmptyNodesStructureNode
}

export interface RowMeta extends CoreRowMeta {
    fields: RowMetaField[]
}
