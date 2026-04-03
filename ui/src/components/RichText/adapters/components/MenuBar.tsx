import './MenuBar.module.less'
import { Editor, useEditorState } from '@tiptap/react'
import { Fragment } from 'react'
import MenuItem from './MenuItem'

export default function MenuBar({ editor }: { editor: Editor }) {
    const items = [
        {
            icon: 'bold',
            title: 'Bold',
            action: () => editor.chain().focus().toggleBold().run(),
            isActiveName: 'bold'
        },
        {
            icon: 'italic',
            title: 'Italic',
            action: () => editor.chain().focus().toggleItalic().run(),
            isActiveName: 'italic'
        },
        {
            icon: 'strikethrough',
            title: 'Strike',
            action: () => editor.chain().focus().toggleStrike().run(),
            isActiveName: 'strike'
        },
        {
            icon: 'code-view',
            title: 'Code',
            action: () => editor.chain().focus().toggleCode().run(),
            isActiveName: 'code'
        },
        {
            type: 'divider'
        },
        {
            icon: 'h-1',
            title: 'Heading 1',
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActiveName: 'heading',
            isActiveAttrs: { level: 1 }
        },
        {
            icon: 'h-2',
            title: 'Heading 2',
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActiveName: 'heading',
            isActiveAttrs: { level: 2 }
        },
        {
            icon: 'h-3',
            title: 'Heading 3',
            action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActiveName: 'heading',
            isActiveAttrs: { level: 3 }
        },
        {
            icon: 'paragraph',
            title: 'Paragraph',
            action: () => editor.chain().focus().setParagraph().run(),
            isActiveName: 'paragraph'
        },
        {
            icon: 'list-unordered',
            title: 'Bullet List',
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActiveName: 'bulletList'
        },
        {
            icon: 'list-ordered',
            title: 'Ordered List',
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActiveName: 'orderedList'
        },
        {
            icon: 'code-box-line',
            title: 'Code Block',
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActiveName: 'codeBlock'
        },
        {
            type: 'divider'
        },
        {
            icon: 'double-quotes-l',
            title: 'Blockquote',
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActiveName: 'blockquote'
        },
        {
            icon: 'separator',
            title: 'Horizontal Rule',
            action: () => editor.chain().focus().setHorizontalRule().run()
        },
        {
            type: 'divider'
        },
        {
            icon: 'table-line',
            title: 'insert-table',
            action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
            isActiveName: 'table'
        },
        {
            type: 'divider'
        },
        {
            icon: 'text-wrap',
            title: 'Hard Break',
            action: () => editor.chain().focus().setHardBreak().run()
        },
        {
            icon: 'format-clear',
            title: 'Clear Format',
            action: () => editor.chain().focus().clearNodes().unsetAllMarks().run()
        },
        {
            type: 'divider'
        },
        {
            icon: 'arrow-go-back-line',
            title: 'Undo',
            action: () => editor.chain().focus().undo().run()
        },
        {
            icon: 'arrow-go-forward-line',
            title: 'Redo',
            action: () => editor.chain().focus().redo().run()
        }
    ]

    const activeStates = useEditorState({
        editor,
        selector: ctx =>
            items.reduce<Record<string, boolean>>((acc, item) => {
                if (item.isActiveName) {
                    acc[item.title as string] = ctx.editor?.isActive(item.isActiveName, item.isActiveAttrs) ?? false
                }
                return acc
            }, {})
    })

    return (
        <div className="editor__header">
            {items.map((item, index) => (
                <Fragment key={index}>
                    {item.type === 'divider' ? (
                        <div className="divider" />
                    ) : (
                        <MenuItem {...item} isActive={item.title ? activeStates[item.title] : false} />
                    )}
                </Fragment>
            ))}
        </div>
    )
}
