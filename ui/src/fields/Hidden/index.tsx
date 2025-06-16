import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Hidden: FieldComponent = () => null

Hidden.Filter = Filter
Hidden.Read = Read
Hidden.Write = Write
