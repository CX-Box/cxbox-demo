import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'
import { FieldComponent } from '../'

export const Checkbox: FieldComponent = () => null

Checkbox.Filter = Filter
Checkbox.Read = Read
Checkbox.Write = Write
