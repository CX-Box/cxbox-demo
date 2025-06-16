import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Money: FieldComponent = () => null

Money.Filter = Filter
Money.Read = Read
Money.Write = Write
