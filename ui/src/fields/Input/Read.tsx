import { useHooks } from '../../hooks/useHooks.ts'
import { isFieldInput } from '../../core/contract/fields'
import { DrillDown } from '../../components/DrillDown.tsx'
import { FieldComponent } from '../'
import { isDataValueString } from '../../core/contract/data.ts'

export const Read: FieldComponent['Read'] = props => {
    const hooks = useHooks()
    const { data: fieldMeta } = hooks.useTypedFieldMeta(isFieldInput, props.widgetName, props.fieldKey)
    if (fieldMeta?.drillDown) {
        return (
            <DrillDown widgetName={props.widgetName} fieldKey={props.fieldKey} id={props.id}>
                {isDataValueString(props.children) ? props.children : null}
            </DrillDown>
        )
    }

    return isDataValueString(props.children) ? props.children : null
}

Read.displayName = 'Input.Read'
