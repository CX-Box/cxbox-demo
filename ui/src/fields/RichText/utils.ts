import { FieldParams, getFieldRowsConfig } from '@utils/getFieldRowsConfig'
import { richTextEditMaxRows, richTextEditMinRows, richTextMaxRows, richTextMinRows } from '@fields/RichText/constants'

export const getRichTextRowsConfig = (params: FieldParams) =>
    getFieldRowsConfig(params, {
        minRows: richTextMinRows,
        maxRows: richTextMaxRows,
        editMinRows: richTextEditMinRows,
        editMaxRows: richTextEditMaxRows
    })
