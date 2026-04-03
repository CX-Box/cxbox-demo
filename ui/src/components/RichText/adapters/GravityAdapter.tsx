import { UniversalEditorProps } from '@components/RichText/interfaces'
import React, { useEffect, useMemo } from 'react'
import { useMarkdownEditor, MarkdownEditorView } from '@gravity-ui/markdown-editor'
import { Toaster, ThemeProvider } from '@gravity-ui/uikit'
import '@gravity-ui/uikit/styles/styles.css'
import '@gravity-ui/markdown-editor/styles/styles.css'

export const GravityAdapter: React.FC<UniversalEditorProps> = ({ value = '', onChange, readOnly }) => {
    const toaster = useMemo(() => new Toaster(), [])

    const editor = useMarkdownEditor({
        preset: 'default',
        md: {
            html: false,
            breaks: true,
            linkify: true
        },
        initial: {
            markup: value,
            mode: 'wysiwyg',
            toolbarVisible: !readOnly,
            splitModeEnabled: true
        }
    })

    useEffect(() => {
        if (!editor) {
            return
        }

        const handleChange = () => {
            const currentMarkdown = editor.getValue()
            onChange(currentMarkdown)
        }

        editor.on('change', handleChange)

        return () => {
            editor.off('change', handleChange)
        }
    }, [editor, onChange])

    useEffect(() => {
        if (!editor) {
            return
        }

        const currentValue = editor.getValue()
        if (value !== currentValue) {
            editor.replace(value)
        }
    }, [value, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="gravity-editor-wrapper">
            <ThemeProvider theme="light">
                <MarkdownEditorView editor={editor} stickyToolbar toaster={toaster} />
            </ThemeProvider>
        </div>
    )
}

export default GravityAdapter
