import { FieldComponent } from '../'
import { Filter } from './Filter.tsx'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'

export const Input: FieldComponent = () => null

Input.Filter = Filter
Input.Read = Read
Input.Write = Write
