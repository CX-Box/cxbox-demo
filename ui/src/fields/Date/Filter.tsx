import { FieldWIP } from '../../components/FieldWIP'
import { FieldComponent } from '../index.ts'

export const Filter: FieldComponent['Filter'] = props => {
    return <FieldWIP type={props.type + '.Filter'} />
}

Filter.displayName = 'Date.Filter'
