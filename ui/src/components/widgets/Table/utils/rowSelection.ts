import { ROW_SELECTION_TYPES } from '@components/widgets/Table/constants'
import { RowSelectionType } from 'antd/es/table'

export const getRowSelectionOffset = (rowSelectionType?: RowSelectionType | string) => {
    return ROW_SELECTION_TYPES.includes(rowSelectionType as RowSelectionType) ? 1 : 0
}
