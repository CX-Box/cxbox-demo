import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Dictionary: FieldComponent = () => null

Dictionary.Filter = Filter
Dictionary.Read = Read
Dictionary.Write = Write
