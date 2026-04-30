import React, { forwardRef, ForwardRefRenderFunction } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'

interface Props {
    readOnly: boolean | undefined
    value: string
    onChange: (value: string) => void
}

const EditorContent: ForwardRefRenderFunction<ReactCodeMirrorRef, Props> = ({ value, readOnly, onChange }, ref) => {
    return (
        <div
            style={{
                display: 'flex',
                position: 'relative',
                width: '100%',
                height: '100%'
            }}
        >
            <CodeMirror
                ref={ref}
                value={value || ''}
                height="100%"
                extensions={[markdown({ base: markdownLanguage, completeHTMLTags: false })]}
                onChange={onChange}
                readOnly={readOnly}
                className="markdown-source-editor"
                style={{ flex: 1, height: '100%', overflowY: 'auto' }}
                basicSetup={{
                    lineNumbers: false,
                    highlightActiveLine: false,
                    foldGutter: false,
                    autocompletion: false
                }}
            />
        </div>
    )
}

export default forwardRef(EditorContent)
