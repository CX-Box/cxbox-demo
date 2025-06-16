import { FieldWIP } from '../../components/FieldWIP.tsx'
import { FieldComponent } from '../index.ts'

export const Write: FieldComponent['Write'] = props => {
    return <FieldWIP type={props.type + '.Write'} />
}

Write.displayName = 'MultivalueHover.Write'
