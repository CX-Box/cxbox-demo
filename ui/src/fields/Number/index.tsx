import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Number: FieldComponent = () => null

Number.Filter = Filter
Number.Read = Read
Number.Write = Write
