import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const Date: FieldComponent = () => null

Date.Filter = Filter
Date.Read = Read
Date.Write = Write
