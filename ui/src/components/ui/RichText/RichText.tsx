import React from 'react'
import { RichTextEditor, RichTextEditorProps } from '@components/RichText/RichTextEditor'

export interface RichTextProps extends RichTextEditorProps {}

const RichText: React.FunctionComponent<RichTextProps> = ({ ...restProps }) => {
    return <RichTextEditor {...restProps} />
}

export default React.memo(RichText)
