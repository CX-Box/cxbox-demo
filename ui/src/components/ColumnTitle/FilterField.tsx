import React from 'react'
import { FilterField as CoreFilterField, NumberInput } from '@cxbox-ui/core'
import { ColumnFilterControlProps } from '@cxbox-ui/core/components/ui/FilterField/FilterField'
import { FieldType } from '@cxbox-ui/core/interfaces/view'
import { DataValue } from '@cxbox-ui/core/interfaces/data'
import { CheckboxFilter } from './CheckboxFilter/CheckboxFilter'
import { CustomFieldTypes } from '../../interfaces/widget'
import { NumberFieldMeta } from '@cxbox-ui/schema/dist/interfaces/widget'

interface FilterFieldProps extends ColumnFilterControlProps {}

function FilterField(props: FilterFieldProps) {
    const { widgetFieldMeta, value, onChange, rowFieldMeta } = props

    switch (widgetFieldMeta.type as string) {
        case FieldType.number:
        case FieldType.money:
        case FieldType.percent:
            const fieldMeta = widgetFieldMeta as NumberFieldMeta
            return (
                <NumberInput
                    value={value as number}
                    type={widgetFieldMeta.type as any}
                    onChange={onChange}
                    digits={fieldMeta.digits}
                    nullable={fieldMeta.nullable}
                    forceFocus={true}
                />
            )
        case CustomFieldTypes.MultipleSelect:
        case FieldType.radio: {
            return (
                <CheckboxFilter
                    title={widgetFieldMeta.title}
                    value={value as DataValue[]}
                    filterValues={rowFieldMeta.filterValues ? rowFieldMeta.filterValues : []}
                    onChange={onChange}
                />
            )
        }
        default: {
            return <CoreFilterField {...props} />
        }
    }
}

export default React.memo(FilterField)
