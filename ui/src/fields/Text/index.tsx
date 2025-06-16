import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Text: FieldComponent = () => null

Text.Filter = Filter
Text.Read = Read
Text.Write = Write
