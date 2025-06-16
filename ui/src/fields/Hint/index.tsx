import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Hint: FieldComponent = () => null

Hint.Filter = Filter
Hint.Read = Read
Hint.Write = Write
