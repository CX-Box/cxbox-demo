import { FieldComponent } from '../index.ts'
import { FieldWIP } from '../../components/FieldWIP.tsx'

export const Filter: FieldComponent['Filter'] = props => {
    return <FieldWIP type={props.type + '.Filter'} />
}

Filter.displayName = 'Text.Filter'
