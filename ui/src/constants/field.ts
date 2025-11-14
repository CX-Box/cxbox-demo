import { FieldType } from '@cxbox-ui/schema'
import { CustomFieldTypes } from '@interfaces/widget'
import { EFeatureSettingKey } from '@interfaces/session'

export const numberFieldTypes: readonly (FieldType | CustomFieldTypes)[] = [FieldType.number, FieldType.money, FieldType.percent]

export const dateFieldTypes: readonly (FieldType | CustomFieldTypes)[] = [FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds]

const rangeFieldTypes: readonly (FieldType | CustomFieldTypes)[] = [...dateFieldTypes, CustomFieldTypes.Time]

export const isRangeFieldType = (fieldType: string, { filterByRangeEnabled }: { [EFeatureSettingKey.filterByRangeEnabled]?: boolean }) => {
    const checkTypes = filterByRangeEnabled ? [...rangeFieldTypes, ...numberFieldTypes] : rangeFieldTypes

    return checkTypes.some(type => type === fieldType)
}
