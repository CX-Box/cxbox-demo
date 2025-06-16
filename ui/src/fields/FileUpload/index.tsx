import { FieldComponent } from '../index.ts'
import { Read } from './Read.tsx'
import { Write } from './Write.tsx'
import { Filter } from './Filter.tsx'

export const FileUpload: FieldComponent = () => null

FileUpload.Filter = Filter
FileUpload.Read = Read
FileUpload.Write = Write
