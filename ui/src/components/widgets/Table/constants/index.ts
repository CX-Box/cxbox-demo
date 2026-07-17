import { RowSelectionType } from 'antd/es/table'
import { FIELDS } from '@constants'
import { Lookup } from '@utils/Lookup'

export const ROW_SELECTION_TYPES: RowSelectionType[] = ['checkbox', 'radio']

export const ROW_KEY = FIELDS.TECHNICAL.ID

export const TREE_ROOT_ID = String(null)

export const RESTORE_ANCESTORS_ID = '__restore-ancestors__'
