import React from 'react'
import { RichTextEditor, RichTextEditorProps } from '@components/RichText/RichTextEditor'
import { AppRichTextWidgetField } from '@interfaces/widget'
import { getRichTextRowsConfig } from '@fields/RichText/utils'

export interface RichTextProps extends Omit<RichTextEditorProps, 'minRows' | 'maxRows' | 'editMinRows' | 'editMaxRows'> {}

const RichText: React.FunctionComponent<RichTextProps> = ({ ...restProps }) => {
    const fieldMeta = restProps.meta as AppRichTextWidgetField | undefined
    const rowsProps = getRichTextRowsConfig({ ...fieldMeta })

    return <RichTextEditor {...restProps} {...rowsProps} />
}

export default React.memo(RichText)
