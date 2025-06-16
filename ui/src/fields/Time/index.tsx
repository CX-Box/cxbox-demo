import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Time: FieldComponent = () => null

Time.Filter = Filter
Time.Read = Read
Time.Write = Write
