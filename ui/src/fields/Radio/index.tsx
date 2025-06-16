import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Radio: FieldComponent = () => null

Radio.Filter = Filter
Radio.Read = Read
Radio.Write = Write
