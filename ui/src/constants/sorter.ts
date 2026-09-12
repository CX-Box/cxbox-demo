import { FieldType } from '@cxbox-ui/core'
import { CustomFieldTypes } from '@interfaces/widget'

export const notSortableFields: readonly (FieldType | CustomFieldTypes)[] = [
    CustomFieldTypes.MultipleSelect,
    FieldType.multivalue,
    FieldType.multivalueHover,
    FieldType.multifield,
    FieldType.hidden,
    FieldType.hint
]
