import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'
import { FieldComponent } from '../'

export const DateTimeWithSeconds: FieldComponent = () => null

DateTimeWithSeconds.Filter = Filter
DateTimeWithSeconds.Read = Read
DateTimeWithSeconds.Write = Write
