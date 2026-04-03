import React from 'react'
import { EditorContent as TiptapEditorContent, Editor } from '@tiptap/react'

interface Props {
    readOnly?: boolean
    editor: Editor
}

const EditorContent: React.FC<Props> = ({ editor, readOnly }) => {
    if (readOnly) {
        return (
            <div className="editor" style={{ background: 'transparent', border: 'none', height: 'auto' }}>
                <TiptapEditorContent className="editor__content" style={{ padding: 0 }} editor={editor} />
            </div>
        )
    }

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>
            <TiptapEditorContent className="editor__content" editor={editor} />
        </div>
    )
}

export default EditorContent
