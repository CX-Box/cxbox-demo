import { RowMetaField as CoreRowMetaField } from '@cxbox-ui/core'

export interface RowMetaField extends CoreRowMetaField {
    fileAccept?: string
    /**
     * TODO: move to core
     */
    sortable?: boolean
}
