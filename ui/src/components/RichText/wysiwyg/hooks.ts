import { useEffect, useMemo } from 'react'
import { useEditor } from '@tiptap/react'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Markdown } from '@tiptap/markdown'
import HardBreak from '@tiptap/extension-hard-break'
import { Colorify } from '@components/RichText/wysiwyg/extensions/Colorify'
import { Bold } from '@tiptap/extension-bold'
import { Italic } from '@tiptap/extension-italic'
import { Code } from '@tiptap/extension-code'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Blockquote } from '@tiptap/extension-blockquote'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { ListItem } from '@tiptap/extension-list-item'
import { Heading } from '@tiptap/extension-heading'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Document } from '@tiptap/extension-document'
import { Gapcursor, TrailingNode, UndoRedo } from '@tiptap/extensions'
import { ListKeymap } from '@tiptap/extension-list'
import { Text } from '@tiptap/extension-text'

const getExtensions = () => [
    Document,
    Blockquote,
    BulletList,
    OrderedList,
    ListItem,
    Heading,
    Paragraph,
    Dropcursor,
    Gapcursor,
    UndoRedo,
    ListKeymap,
    Text,
    TrailingNode,
    Code,
    CodeBlock,
    Italic,
    Bold,
    Colorify,
    Strike.extend({
        // The plugin is missing a property, which is why the conversion from md to wysiwyg did not work when disabling gfm in the markdown extension
        markdownTokenizer: {
            name: 'del',
            level: 'inline',
            start(src: string) {
                return src.indexOf('~~')
            },
            tokenize(src, tokens, lexer) {
                const rule = /^~~(?=\S)([\s\S]*?\S)~~/
                const match = rule.exec(src)
                if (match) {
                    return {
                        type: 'del',
                        raw: match[0],
                        text: match[1],
                        tokens: lexer.inlineTokens(match[1])
                    }
                }
                return undefined
            }
        }
    }),
    Underline,
    HardBreak,
    Image.configure({ inline: true, allowBase64: true }),
    Link.configure({
        openOnClick: false,
        autolink: false,
        protocols: ['http', 'https', 'mailto']
    }),
    Markdown.configure({
        markedOptions: {
            gfm: false,
            breaks: true
        }
    })
]

interface UseRichTextEditorProps {
    value: string
    onChange: (markdown: string) => void
    readOnly?: boolean
    onBlur?: () => void
    onFocus?: () => void
}

export const useRichTextEditor = ({ value, onChange, readOnly = false, onBlur, onFocus }: UseRichTextEditorProps) => {
    const extensions = useMemo(() => getExtensions(), [])

    const editor = useEditor({
        extensions,
        content: value,
        contentType: 'markdown',
        editable: !readOnly,
        onUpdate: ({ editor: instance }) => {
            onChange(instance.getMarkdown())
        },
        onBlur,
        onFocus
    })

    useEffect(() => {
        if (!editor) {
            return
        }

        const currentValue = editor.getMarkdown()

        if (value !== currentValue) {
            editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })
        }
    }, [value, editor])

    return { editor }
}
