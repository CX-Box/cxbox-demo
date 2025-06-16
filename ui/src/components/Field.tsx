import get from 'lodash.get'
import camelCase from 'lodash.camelcase'
import * as Fields from '../fields'
import { FieldError } from './FieldError.tsx'
import { FieldComponent } from '../fields'
import upperFirst from 'lodash.upperfirst'

export const Field: FieldComponent = () => null

const Read: FieldComponent['Read'] = props => {
    const type = upperFirst(camelCase(props.type))
    const FieldComponent: FieldComponent['Read'] = get(Fields, [type, 'Read'], () => <FieldError type={type} />)
    return (
        <FieldComponent type={type} widgetName={props.widgetName} fieldKey={props.fieldKey} id={props.id}>
            {props.children}
        </FieldComponent>
    )
}
Read.displayName = 'Field.Read'
Field.Read = Read

const Write: FieldComponent['Write'] = props => {
    const type = upperFirst(camelCase(props.type))
    const FieldComponent: FieldComponent['Write'] = get(Fields, [type, 'Write'], () => <FieldError type={type} />)
    return <FieldComponent type={type} widgetName={props.widgetName} fieldKey={props.fieldKey} id={props.id} />
}
Write.displayName = 'Field.Write'
Field.Write = Write

const Filter: FieldComponent['Filter'] = props => {
    const type = upperFirst(camelCase(props.type))
    const FieldComponent: FieldComponent['Filter'] = get(Fields, [type, 'Filter'], () => <FieldError type={type} />)
    return <FieldComponent type={type} widgetName={props.widgetName} fieldKey={props.fieldKey} onClose={props.onClose} />
}
Filter.displayName = 'Field.Filter'
Field.Filter = Filter
