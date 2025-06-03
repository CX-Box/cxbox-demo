import { FieldType, WidgetFieldBase } from '@cxbox-ui/core'
import { RowMetaField } from '@interfaces/rowMeta'

export const isHiddenFieldByMeta = (fieldMeta: WidgetFieldBase | undefined) => {
    return fieldMeta ? fieldMeta.type === FieldType.hidden || fieldMeta.hidden : true
}

export const isHiddenFieldByRowMeta = (fieldKey: string, rowMetaFields: RowMetaField[] | undefined) => {
    const fieldMetaFromRowMeta = rowMetaFields?.find(rowMetaField => rowMetaField.key === fieldKey)

    return fieldMetaFromRowMeta ? !!fieldMetaFromRowMeta.hidden : false
}
