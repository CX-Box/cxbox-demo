import React, { forwardRef, ForwardRefRenderFunction, useRef, useState, useEffect, useCallback } from 'react'
import CodeMirror, { EditorView, ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { useMergeRefs } from '@hooks/useMergeRefs'

interface Props {
    readOnly: boolean | undefined
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    placeholder?: string
}

const DEBOUNCE_MS = 120

const EditorContent: ForwardRefRenderFunction<ReactCodeMirrorRef, Props> = ({ value, readOnly, onChange, disabled, placeholder }, ref) => {
    const editorDomRef = useRef<HTMLElement | null>(null)
    const [localValue, setLocalValue] = useState<string>(value ?? '')
    const lastEmittedRef = useRef<string>(value ?? '')
    const onChangeRef = useRef(onChange)
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        const externalValue = value ?? ''
        if (externalValue === lastEmittedRef.current) {
            return
        }
        if (externalValue === localValue) {
            lastEmittedRef.current = externalValue
            return
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
            debounceTimerRef.current = null
        }
        setLocalValue(externalValue)
        lastEmittedRef.current = externalValue
    }, [value, localValue])

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
                debounceTimerRef.current = null
            }
        }
    }, [])

    const scheduleEmit = useCallback((nextValue: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }
        debounceTimerRef.current = setTimeout(() => {
            if (nextValue !== lastEmittedRef.current) {
                lastEmittedRef.current = nextValue
                onChangeRef.current(nextValue)
            }
            debounceTimerRef.current = null
        }, DEBOUNCE_MS)
    }, [])

    const handleEditorChange = useCallback(
        (nextValue: string) => {
            if (disabled || readOnly) {
                return
            }
            setLocalValue(nextValue)
            scheduleEmit(nextValue)
        },
        [disabled, readOnly, scheduleEmit]
    )

    const setRefs = useMergeRefs([
        ref,
        (instance: ReactCodeMirrorRef | null) => {
            editorDomRef.current = instance?.editor ?? null
        }
    ])

    return (
        <CodeMirror
            ref={setRefs}
            placeholder={placeholder}
            value={localValue || ''}
            height="100%"
            extensions={[markdown({ base: markdownLanguage, completeHTMLTags: false }), EditorView.lineWrapping]}
            onChange={handleEditorChange}
            readOnly={disabled || readOnly}
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
