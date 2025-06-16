import { FieldComponent } from '../index.ts'
import { FieldWIP } from '../../components/FieldWIP.tsx'

export const Read: FieldComponent['Read'] = props => {
    return <FieldWIP type={props.type + '.Read'} />
}

Read.displayName = 'DateTime.Read'
