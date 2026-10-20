import React, { forwardRef, ForwardRefRenderFunction, useRef, useState, useEffect, useCallback } from 'react'
import CodeMirror, { EditorView, ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { useMergeRefs } from '@hooks/useMergeRefs'

interface Props {
    readOnly: boolean | undefined
    value: string
    onUserChange?: () => void
    autoFocus?: boolean
    disabled?: boolean
    placeholder?: string
}

const EditorContent: ForwardRefRenderFunction<ReactCodeMirrorRef, Props> = (
    { value, readOnly, onUserChange, autoFocus, disabled, placeholder },
    ref
) => {
    const editorDomRef = useRef<HTMLElement | null>(null)
    const [localValue, setLocalValue] = useState<string>(value ?? '')
    // the value the text was made from: only another value replaces the text
    const shownValueRef = useRef(value)

    useEffect(() => {
        if (value === shownValueRef.current) {
            return
        }

        shownValueRef.current = value
        setLocalValue(value ?? '')
    }, [value])

    const handleEditorChange = useCallback(
        (nextValue: string) => {
            if (disabled || readOnly) {
                return
            }
            setLocalValue(nextValue)
            onUserChange?.()
        },
        [disabled, readOnly, onUserChange]
    )

    const setRefs = useMergeRefs([
        ref,
        (instance: ReactCodeMirrorRef | null) => {
            editorDomRef.current = instance?.editor ?? null
        }
    ])

    const editable = !(disabled || readOnly)

    return (
        <CodeMirror
            ref={setRefs}
            placeholder={placeholder}
            autoFocus={autoFocus}
            // like the visual editor: the cursor goes to the end of the text
            onCreateEditor={autoFocus ? view => view.dispatch({ selection: { anchor: view.state.doc.length } }) : undefined}
            value={localValue || ''}
            height="100%"
            extensions={[markdown({ base: markdownLanguage, completeHTMLTags: false }), EditorView.lineWrapping]}
            onChange={handleEditorChange}
            readOnly={!editable}
            editable={editable}
            className="markdown-source-editor"
            basicSetup={{
                lineNumbers: false,
                highlightActiveLine: false,
                foldGutter: false,
                autocompletion: false
            }}
        />
    )
}

export default forwardRef(EditorContent)
