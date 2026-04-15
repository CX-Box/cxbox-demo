import React from 'react'
import { EditorContent as TiptapEditorContent, Editor } from '@tiptap/react'
import cn from 'classnames'

interface Props {
    readOnly?: boolean
    editor: Editor
    disabled?: boolean
    placeholder?: string
}

const EditorContent: React.FC<Props> = ({ editor, readOnly, disabled, placeholder }) => {
    if (readOnly) {
        return <TiptapEditorContent className={cn('editor__content', 'readOnly')} editor={editor} disabled={true} />
    }

    return <TiptapEditorContent className="editor__content" editor={editor} disabled={disabled} placeholder={placeholder} />
}

export default EditorContent
