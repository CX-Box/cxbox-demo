import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'
import { FieldComponent } from '../'

export const DateTime: FieldComponent = () => null

DateTime.Filter = Filter
DateTime.Read = Read
DateTime.Write = Write
