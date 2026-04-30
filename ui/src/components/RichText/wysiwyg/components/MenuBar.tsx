import './MenuBar.module.less'
import { Editor, useEditorState } from '@tiptap/react'
import { MenuItemType, ViewMode } from '../../common/types'
import CommonMenuBar, { MenuBarItem } from '@components/RichText/common/components/MenuBar'

interface Props {
    editor: Editor
    onViewModeChange: (mode: ViewMode) => void
}

export default function MenuBar({ editor, onViewModeChange }: Props) {
    const items: readonly MenuItemType[] = [
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
            icon: 'underline',
            title: 'Underline',
            action: () => editor.chain().focus().toggleUnderline().run(),
            isActiveName: 'underline'
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
            icon: 'palette-line',
            title: 'Red Text',
            action: () => editor.chain().focus().toggleColorify('red').run(),
            isActiveName: 'colorify',
            isActiveAttrs: { color: 'red' },
            style: { color: 'red' }
        },
        {
            icon: 'palette-line',
            title: 'Blue Text',
            action: () => editor.chain().focus().toggleColorify('blue').run(),
            isActiveName: 'colorify',
            isActiveAttrs: { color: 'blue' },
            style: { color: 'blue' }
        },
        {
            icon: 'palette-line',
            title: 'Yellow Text',
            action: () => editor.chain().focus().toggleColorify('yellow').run(),
            isActiveName: 'colorify',
            isActiveAttrs: { color: 'yellow' },
            style: { color: 'yellow' }
        },
        {
            icon: 'double-quotes-l',
            title: 'Blockquote',
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActiveName: 'blockquote'
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
                if (item.type !== 'divider' && item.isActiveName) {
                    acc[item.title as string] = ctx.editor?.isActive(item.isActiveName, item.isActiveAttrs) ?? false
                }
                return acc
            }, {})
    })

    const isActive = (name: string | undefined) => (name ? activeStates[name] : false)

    const menuItems: MenuBarItem[] = items.map(item => {
        if (item.type === 'divider') {
            return { type: 'divider' }
        }
        return {
            icon: item.icon,
            title: item.title,
            action: item.action,
            isActive: isActive(item.title)
        }
    })

    return (
        <CommonMenuBar
            items={menuItems}
            rightButton={{
                icon: 'code-box-line',
                title: 'View Markdown',
                action: () => onViewModeChange('source')
            }}
        />
    )
}
