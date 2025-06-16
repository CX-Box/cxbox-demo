import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Multivalue: FieldComponent = () => null

Multivalue.Filter = Filter
Multivalue.Read = Read
Multivalue.Write = Write
