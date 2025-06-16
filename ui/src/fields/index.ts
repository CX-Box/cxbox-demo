import React from 'react'
import { DataValue } from '../core/contract/data.ts'

export interface FieldComponent {
    (): void
    Read: React.FC<ReadFieldProps>
    Write: React.FC<WriteFieldProps>
    Filter: React.FC<FilterFieldProps>
}

interface FieldProps {
    type: string
    widgetName: string
    fieldKey: string
}

interface ReadFieldProps extends FieldProps {
    id: string
    children: DataValue
}

interface WriteFieldProps extends FieldProps {
    id: string
}

interface FilterFieldProps extends FieldProps {
    onClose: () => void
}

export * from './Checkbox'
export * from './Date'
export * from './DateTime'
export * from './DateTimeWithSeconds'
export * from './Dictionary'
export * from './FileUpload'
export * from './Hidden'
export * from './Hint'
export * from './InlinePickList'
export * from './Input'
export * from './Money'
export * from './Multifield'
export * from './MultipleSelect'
export * from './Multivalue'
export * from './MultivalueHover'
export * from './Number'
export * from './Percent'
export * from './PickList'
export * from './Radio'
export * from './SuggestionPickList'
export * from './Text'
export * from './Time'
