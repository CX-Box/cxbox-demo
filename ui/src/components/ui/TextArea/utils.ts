import { FieldParams, getFieldRowsConfig } from '@utils/getFieldRowsConfig'
import { textEditMaxRows, textEditMinRows, textMaxRows, textMinRows } from '@components/ui/TextArea/constants'

export const getTextRowsConfig = (params: FieldParams) =>
    getFieldRowsConfig(params, {
        minRows: textMinRows,
        maxRows: textMaxRows,
        editMinRows: textEditMinRows,
        editMaxRows: textEditMaxRows
    })
