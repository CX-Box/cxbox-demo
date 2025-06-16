import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const InlinePickList: FieldComponent = () => null

InlinePickList.Filter = Filter
InlinePickList.Read = Read
InlinePickList.Write = Write
