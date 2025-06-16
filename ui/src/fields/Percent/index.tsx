import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Percent: FieldComponent = () => null

Percent.Filter = Filter
Percent.Read = Read
Percent.Write = Write
