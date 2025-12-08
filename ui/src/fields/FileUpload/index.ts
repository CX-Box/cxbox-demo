import { FieldComponent } from '@features'
import { default as TempFileUpload } from '../_temp_fields/FileUpload/FileUploadContainer'

export const FileUpload: FieldComponent = () => null

FileUpload.Filter = TempFileUpload
FileUpload.Read = TempFileUpload
FileUpload.Write = TempFileUpload
