import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const PickList: FieldComponent = () => null

PickList.Filter = Filter
PickList.Read = Read
PickList.Write = Write
