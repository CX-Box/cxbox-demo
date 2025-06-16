import { FieldComponent } from '../index.ts'
import { Filter } from './Filter.tsx'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'

export const MultipleSelect: FieldComponent = () => null

MultipleSelect.Filter = Filter
MultipleSelect.Read = Read
MultipleSelect.Write = Write
