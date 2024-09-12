import { RowMetaField as CoreRowMetaField } from '@interfaces/core'

export interface RowMetaField extends CoreRowMetaField {
    fileAccept?: string
    /**
     * TODO: move to core
     */
    sortable?: boolean
}
