import './MenuBar.module.less'
import { Editor, useEditorState } from '@tiptap/react'
import { MenuItemType, ViewMode } from '../../common/types'
import CommonMenuBar from '@components/RichText/common/components/MenuBar'
import { MenuBarItem } from '@components/RichText/common/components/MenuItem'
import {
    ArrowUturnCcwLeft,
    ArrowUturnCwRight,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading,
    Text,
    ListUl,
    ListOl,
    TextIndent,
    TextOutdent,
    Code,
    Terminal,
    Font,
    QuoteClose,
    Eraser,
    LogoMarkdown,
    Gear
} from '@gravity-ui/icons'
import React, { useMemo } from 'react'

interface Props {
    editor: Editor
    onViewModeChange: (mode: ViewMode) => void
    toolbarDisabled?: boolean
}

export default function MenuBar({ editor, onViewModeChange, toolbarDisabled }: Props) {
    const items: readonly MenuItemType[] = useMemo(
        () => [
            {
                icon: <ArrowUturnCcwLeft width={16} height={16} />,
                title: 'Undo',
                action: () => editor.chain().focus().undo().run()
            },
            {
                icon: <ArrowUturnCwRight width={16} height={16} />,
                title: 'Redo',
                action: () => editor.chain().focus().redo().run()
            },
            {
                type: 'divider'
            },
            {
                icon: <Bold width={16} height={16} />,
                title: 'Bold',
                action: () => editor.chain().focus().toggleBold().run(),
                isActiveName: 'bold'
            },
            {
                icon: <Italic width={16} height={16} />,
                title: 'Italic',
                action: () => editor.chain().focus().toggleItalic().run(),
                isActiveName: 'italic'
            },
            {
                icon: <Underline width={16} height={16} />,
                title: 'Underline',
                action: () => editor.chain().focus().toggleUnderline().run(),
                isActiveName: 'underline'
            },
            {
                icon: <Strikethrough width={16} height={16} />,
                title: 'Strikethrough',
                action: () => editor.chain().focus().toggleStrike().run(),
                isActiveName: 'strike'
            },
            {
                type: 'divider'
            },
            {
                icon: <Heading width={16} height={16} />,
                title: 'Heading',
                isActiveName: 'heading',
                items: [
                    {
                        icon: <Text width={16} height={16} />,
                        title: 'Text',
                        action: () => editor.chain().focus().setParagraph().run()
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        title: 'Heading 1',
                        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 1 }
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        title: 'Heading 2',
                        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 2 }
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        title: 'Heading 3',
                        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 3 }
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        title: 'Heading 4',
                        action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 4 }
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        title: 'Heading 5',
                        action: () => editor.chain().focus().toggleHeading({ level: 5 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 5 }
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        title: 'Heading 6',
                        action: () => editor.chain().focus().toggleHeading({ level: 6 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 6 }
                    }
                ]
            },
            {
                icon: <ListUl width={16} height={16} />,
                title: 'List',
                items: [
                    {
                        icon: <ListUl width={16} height={16} />,
                        title: 'Bullet List',
                        action: () => editor.chain().focus().toggleBulletList().run(),
                        isActiveName: 'bulletList'
                    },
                    {
                        icon: <ListOl width={16} height={16} />,
                        title: 'Ordered List',
                        action: () => editor.chain().focus().toggleOrderedList().run(),
                        isActiveName: 'orderedList'
                    },
                    {
                        icon: <TextIndent width={16} height={16} />,
                        title: 'Sink Item',
                        action: () => editor.chain().focus().sinkListItem('listItem').run()
                    },
                    {
                        icon: <TextOutdent width={16} height={16} />,
                        title: 'Lift Item',
                        action: () => editor.chain().focus().liftListItem('listItem').run()
                    }
                ]
            },
            {
                icon: <Code width={16} height={16} />,
                title: 'Code',
                isActiveName: 'code',
                items: [
                    {
                        icon: <Code width={16} height={16} />,
                        title: 'Inline code',
                        action: () => editor.chain().focus().toggleCode().run(),
                        isActiveName: 'code'
                    },
                    {
                        icon: <Terminal width={16} height={16} />,
                        title: 'Code block',
                        action: () => editor.chain().focus().toggleCodeBlock().run(),
                        isActiveName: 'codeBlock'
                    }
                ]
            },
            {
                type: 'divider'
            },
            {
                icon: <Font width={16} height={16} />,
                title: 'Text color',
                isActiveName: 'colorify',
                groupName: 'Text',
                items: [
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-default)" />,
                        title: 'Default',
                        action: () => editor.chain().focus().unsetColorify().run()
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-gray)" />,
                        title: 'Gray',
                        action: () => editor.chain().focus().toggleColorify('gray').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'gray' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-yellow)" />,
                        title: 'Yellow',
                        action: () => editor.chain().focus().toggleColorify('yellow').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'yellow' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-orange)" />,
                        title: 'Orange',
                        action: () => editor.chain().focus().toggleColorify('orange').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'orange' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-red)" />,
                        title: 'Red',
                        action: () => editor.chain().focus().toggleColorify('red').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'red' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-green)" />,
                        title: 'Green',
                        action: () => editor.chain().focus().toggleColorify('green').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'green' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-blue)" />,
                        title: 'Blue',
                        action: () => editor.chain().focus().toggleColorify('blue').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'blue' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-violet)" />,
                        title: 'Violet',
                        action: () => editor.chain().focus().toggleColorify('violet').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'violet' }
                    }
                ]
            },
            {
                icon: <QuoteClose width={16} height={16} />,
                title: 'Quote',
                action: () => editor.chain().focus().toggleBlockquote().run(),
                isActiveName: 'blockquote'
            },
            {
                type: 'divider'
            },

            {
                icon: <Eraser width={16} height={16} />,
                title: 'Clear Format',
                action: () => editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
        ],
        [editor]
    )

    const editorState = useEditorState({
        editor,
        selector: ctx => {
            const activeStates: Record<string, boolean> = {}

            const checkItem = (item: MenuItemType) => {
                if (item.type !== 'divider' && item.isActiveName && item.title) {
                    activeStates[item.title as string] = ctx.editor?.isActive(item.isActiveName, item.isActiveAttrs) ?? false
                }

                if (item.type !== 'divider' && item.items && Array.isArray(item.items)) {
                    item.items.forEach(checkItem)
                }
            }

            items.forEach(checkItem)

            const disabledStates: Record<string, boolean> = {
                Undo: !(ctx.editor?.can().undo() ?? false),
                Redo: !(ctx.editor?.can().redo() ?? false),
                'Sink Item': !(ctx.editor?.can().sinkListItem('listItem') ?? false),
                'Lift Item': !(ctx.editor?.can().liftListItem('listItem') ?? false)
            }

            return {
                activeStates,
                disabledStates
            }
        }
    })

    const isActive = (name: string | undefined) => (name ? editorState.activeStates[name] : false)
    const isDisabled = (name: string | undefined) => (name ? editorState.disabledStates[name] : false)

    const menuItems: MenuBarItem[] = items.map(item => {
        if (item.type === 'divider') {
            return { type: 'divider' }
        }

        return {
            ...item,
            icon: item.icon,
            title: item.title,
            action: item.action,
            isActive: isActive(item.title),
            disabled: isDisabled(item.title),
            items: item.items?.map(subItem => ({
                ...subItem,
                isActive: isActive(subItem.title),
                disabled: isDisabled(subItem.title)
            }))
        }
    })

    return (
        <CommonMenuBar
            toolbarDisabled={toolbarDisabled}
            items={menuItems}
            rightButton={{
                icon: <Gear width={16} height={16} />,
                title: 'Settings',
                items: [
                    {
                        icon: <LogoMarkdown width={16} height={16} />,
                        title: 'Markdown markup',
                        action: () => onViewModeChange('source')
                    }
                ]
            }}
        />
    )
}
