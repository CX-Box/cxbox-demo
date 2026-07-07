import './MenuBar.module.less'
import { Editor, useEditorState } from '@tiptap/react'
import { MenuItemType, ViewMode } from '../../common/types'
import CommonMenuBar from '@fields/RichText/common/components/MenuBar'
import { MenuBarItem } from '@fields/RichText/common/components/MenuItem'
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
import { useTranslation } from 'react-i18next'

interface Props {
    editor: Editor
    onViewModeChange: (mode: ViewMode) => void
    toolbarDisabled?: boolean
}

export default function MenuBar({ editor, onViewModeChange, toolbarDisabled }: Props) {
    const { t } = useTranslation()

    const items: readonly MenuItemType[] = useMemo(
        () => [
            {
                icon: <ArrowUturnCcwLeft width={16} height={16} />,
                key: 'Undo',
                title: t('Undo'),
                action: () => editor.chain().focus().undo().run()
            },
            {
                icon: <ArrowUturnCwRight width={16} height={16} />,
                key: 'Redo',
                title: t('Redo'),
                action: () => editor.chain().focus().redo().run()
            },
            {
                type: 'divider'
            },
            {
                icon: <Bold width={16} height={16} />,
                key: 'Bold',
                title: t('Bold'),
                action: () => editor.chain().focus().toggleBold().run(),
                isActiveName: 'bold'
            },
            {
                icon: <Italic width={16} height={16} />,
                key: 'Italic',
                title: t('Italic'),
                action: () => editor.chain().focus().toggleItalic().run(),
                isActiveName: 'italic'
            },
            {
                icon: <Underline width={16} height={16} />,
                key: 'Underline',
                title: t('Underline'),
                action: () => editor.chain().focus().toggleUnderline().run(),
                isActiveName: 'underline'
            },
            {
                icon: <Strikethrough width={16} height={16} />,
                key: 'Strikethrough',
                title: t('Strikethrough'),
                action: () => editor.chain().focus().toggleStrike().run(),
                isActiveName: 'strike'
            },
            {
                type: 'divider'
            },
            {
                icon: <Heading width={16} height={16} />,
                key: 'Heading',
                title: t('Heading'),
                isActiveName: 'heading',
                items: [
                    {
                        icon: <Text width={16} height={16} />,
                        key: 'Text',
                        title: t('Text'),
                        action: () => editor.chain().focus().setParagraph().run()
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 1',
                        title: t('Heading 1'),
                        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 1 }
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 2',
                        title: t('Heading 2'),
                        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 2 }
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 3',
                        title: t('Heading 3'),
                        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 3 }
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 4',
                        title: t('Heading 4'),
                        action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 4 }
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 5',
                        title: t('Heading 5'),
                        action: () => editor.chain().focus().toggleHeading({ level: 5 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 5 }
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 6',
                        title: t('Heading 6'),
                        action: () => editor.chain().focus().toggleHeading({ level: 6 }).run(),
                        isActiveName: 'heading',
                        isActiveAttrs: { level: 6 }
                    }
                ]
            },
            {
                icon: <ListUl width={16} height={16} />,
                key: 'List',
                title: t('List'),
                items: [
                    {
                        icon: <ListUl width={16} height={16} />,
                        key: 'Bullet List',
                        title: t('Bullet List'),
                        action: () => editor.chain().focus().toggleBulletList().run(),
                        isActiveName: 'bulletList'
                    },
                    {
                        icon: <ListOl width={16} height={16} />,
                        key: 'Ordered List',
                        title: t('Ordered List'),
                        action: () => editor.chain().focus().toggleOrderedList().run(),
                        isActiveName: 'orderedList'
                    },
                    {
                        icon: <TextIndent width={16} height={16} />,
                        key: 'Sink Item',
                        title: t('Sink Item'),
                        action: () => editor.chain().focus().sinkListItem('listItem').run()
                    },
                    {
                        icon: <TextOutdent width={16} height={16} />,
                        key: 'Lift Item',
                        title: t('Lift Item'),
                        action: () => editor.chain().focus().liftListItem('listItem').run()
                    }
                ]
            },
            {
                icon: <Code width={16} height={16} />,
                key: 'Code',
                title: t('Code'),
                isActiveName: 'code',
                items: [
                    {
                        icon: <Code width={16} height={16} />,
                        key: 'Inline code',
                        title: t('Inline code'),
                        action: () => editor.chain().focus().toggleCode().run(),
                        isActiveName: 'code'
                    },
                    {
                        icon: <Terminal width={16} height={16} />,
                        key: 'Code block',
                        title: t('Code block'),
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
                key: 'Text color',
                title: t('Text color'),
                isActiveName: 'colorify',
                groupName: t('Text'),
                items: [
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-default)" />,
                        key: 'Default',
                        title: t('Default'),
                        action: () => editor.chain().focus().unsetColorify().run()
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-gray)" />,
                        key: 'Gray',
                        title: t('Gray'),
                        action: () => editor.chain().focus().toggleColorify('gray').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'gray' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-yellow)" />,
                        key: 'Yellow',
                        title: t('Yellow'),
                        action: () => editor.chain().focus().toggleColorify('yellow').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'yellow' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-orange)" />,
                        key: 'Orange',
                        title: t('Orange'),
                        action: () => editor.chain().focus().toggleColorify('orange').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'orange' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-red)" />,
                        key: 'Red',
                        title: t('Red'),
                        action: () => editor.chain().focus().toggleColorify('red').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'red' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-green)" />,
                        key: 'Green',
                        title: t('Green'),
                        action: () => editor.chain().focus().toggleColorify('green').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'green' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-blue)" />,
                        key: 'Blue',
                        title: t('Blue'),
                        action: () => editor.chain().focus().toggleColorify('blue').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'blue' }
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-violet)" />,
                        key: 'Violet',
                        title: t('Violet'),
                        action: () => editor.chain().focus().toggleColorify('violet').run(),
                        isActiveName: 'colorify',
                        isActiveAttrs: { color: 'violet' }
                    }
                ]
            },
            {
                icon: <QuoteClose width={16} height={16} />,
                key: 'Quote',
                title: t('Quote'),
                action: () => editor.chain().focus().toggleBlockquote().run(),
                isActiveName: 'blockquote'
            },
            {
                type: 'divider'
            },

            {
                icon: <Eraser width={16} height={16} />,
                key: 'Clear Format',
                title: t('Clear Format'),
                action: () => editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
        ],
        [editor, t]
    )

    const editorState = useEditorState({
        editor,
        selector: ctx => {
            const activeStates: Record<string, boolean> = {}

            const checkItem = (item: MenuItemType) => {
                if (item.type !== 'divider' && item.isActiveName && item.key) {
                    activeStates[item.key as string] = ctx.editor?.isActive(item.isActiveName, item.isActiveAttrs) ?? false
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
            isActive: isActive(item.key),
            disabled: isDisabled(item.key),
            items: item.items?.map(subItem => ({
                ...subItem,
                isActive: isActive(subItem.key),
                disabled: isDisabled(subItem.key)
            }))
        }
    })

    return (
        <CommonMenuBar
            toolbarDisabled={toolbarDisabled}
            items={menuItems}
            rightButton={{
                key: 'Settings',
                icon: <Gear width={16} height={16} />,
                title: t('Settings'),
                items: [
                    {
                        key: 'Markdown markup',
                        icon: <LogoMarkdown width={16} height={16} />,
                        title: t('Markdown markup'),
                        action: () => onViewModeChange('source')
                    }
                ]
            }}
        />
    )
}
