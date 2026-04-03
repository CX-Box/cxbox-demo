import { UniversalEditorProps } from '@components/RichText/interfaces'
import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { TableKit } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Markdown } from '@tiptap/markdown'
import HardBreak from '@tiptap/extension-hard-break'
import './TiptapAdapter.module.less'
import MenuBar from '@components/RichText/adapters/components/MenuBar'

export const TiptapAdapter: React.FC<UniversalEditorProps> = ({ value, onChange, readOnly, onBlur, onFocus }) => {
    const editor = useEditor({
        extensions: [
            Markdown.configure(),
            StarterKit.configure(),
            HardBreak,
            Underline,
            Superscript,
            Subscript,
            TextAlign.configure({
                types: ['heading', 'paragraph']
            }),
            TableKit.configure({
                table: { resizable: true }
            }),
            TableRow,
            TableHeader,
            TableCell,
            Image.configure({
                inline: true,
                allowBase64: true
            }),
            Link.configure({
                openOnClick: false,
                autolink: true
            })
        ],
        content: value,
        editable: !readOnly,
        onUpdate: ({ editor: editorInstance }) => {
            const md = editorInstance.getMarkdown()
            onChange(md)
        },
        onBlur: () => onBlur?.(),
        onFocus: () => onFocus?.()
    })

    useEffect(() => {
        if (!editor) {
            return
        }

        const currentMarkdown = editor.getMarkdown()
        if (value !== currentMarkdown) {
            editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })
        }
    }, [value, editor])

    if (!editor) {
        return null
    }

    if (readOnly) {
        return (
            <div className="editor" style={{ background: 'transparent', border: 'none', height: 'auto' }}>
                <EditorContent className="editor__content" style={{ padding: 0 }} editor={editor} />
            </div>
        )
    }

    return (
        <div className="markdown-parser-demo">
            <div className="editor-panel">
                <div className="editor">
                    {editor && <MenuBar editor={editor} />}
                    <div style={{ display: 'flex', alignItems: 'stretch', position: 'relative', height: '100%' }}>
                        <EditorContent className="editor__content" editor={editor} />
                        <div
                            style={{
                                display: 'flex',
                                position: 'relative',
                                width: '50%',
                                height: '100%'
                            }}
                        >
                            <textarea
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    borderLeft: '1px solid var(--field-border-color)',
                                    outline: 'none',
                                    padding: '20px 16px',
                                    height: '100%'
                                }}
                                className="markdown-input"
                                value={value || ''}
                                onChange={e => onChange(e.target.value)}
                                disabled={readOnly}
                                placeholder="Введите markdown..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TiptapAdapter
