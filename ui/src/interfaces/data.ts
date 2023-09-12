import { MultivalueSingleValue as MultivalueSingleValueCore } from '@cxbox-ui/schema/src/interfaces/data'

export interface MultivalueSingleValue extends MultivalueSingleValueCore {
    options: MultivalueSingleValueCore['options'] & { primary?: boolean | null }
}
