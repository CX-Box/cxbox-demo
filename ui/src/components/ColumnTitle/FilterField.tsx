import React from 'react'
import { FilterField as CoreFilterField, NumberInput } from '@cxbox-ui/core'
import { ColumnFilterControlProps } from '@cxbox-ui/core/components/ui/FilterField/FilterField'
import { FieldType } from '@cxbox-ui/core/interfaces/view'
import { DataValue } from '@cxbox-ui/core/interfaces/data'
import { CheckboxFilter } from './CheckboxFilter/CheckboxFilter'

interface FilterFieldProps extends ColumnFilterControlProps {}

function FilterField(props: FilterFieldProps) {
    const { widgetFieldMeta, value, onChange, rowFieldMeta } = props

    switch (widgetFieldMeta.type) {
        case FieldType.number:
        case FieldType.money:
        case FieldType.percent:
            return (
                <NumberInput
                    value={value as number}
                    type={widgetFieldMeta.type as any}
                    onChange={onChange}
                    digits={widgetFieldMeta.digits}
                    nullable={widgetFieldMeta.nullable}
                    forceFocus={true}
                />
            )
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
