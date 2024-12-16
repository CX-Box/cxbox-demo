import { FieldType } from '@cxbox-ui/schema'
import { CustomFieldTypes } from '@interfaces/widget'

export const rightAlignedFields: readonly (FieldType | CustomFieldTypes)[] = [FieldType.number, FieldType.money, FieldType.percent]
