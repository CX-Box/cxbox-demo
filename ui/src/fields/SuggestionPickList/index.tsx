import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const SuggestionPickList: FieldComponent = () => null

SuggestionPickList.Filter = Filter
SuggestionPickList.Read = Read
SuggestionPickList.Write = Write
