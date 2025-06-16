import { FieldWIP } from '../../components/FieldWIP.tsx'
import { FieldComponent } from '../index.ts'

export const Read: FieldComponent['Read'] = props => {
    return <FieldWIP type={props.type + '.Read'} />
}

Read.displayName = 'Number.Read'
