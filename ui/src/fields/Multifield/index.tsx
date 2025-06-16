import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Multifield: FieldComponent = () => null

Multifield.Filter = Filter
Multifield.Read = Read
Multifield.Write = Write
