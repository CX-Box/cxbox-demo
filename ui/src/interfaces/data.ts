import { interfaces } from '@cxbox-ui/core'

export interface MultivalueSingleValue extends interfaces.MultivalueSingleValue {
    options: interfaces.MultivalueSingleValue['options'] & { primary?: boolean | null }
}

export interface SuggestionPickListDataItem {
    value: string
    id: string
    [key: string]: any
}
