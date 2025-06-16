import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const MultivalueHover: FieldComponent = () => null

MultivalueHover.Filter = Filter
MultivalueHover.Read = Read
MultivalueHover.Write = Write
