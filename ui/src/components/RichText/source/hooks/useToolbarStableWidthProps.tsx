import React, { useMemo } from 'react'
import { MenuItemType } from '@components/RichText/common/types'
import {
    ArrowUturnCcwLeft,
    ArrowUturnCwRight,
    Bold,
    Code,
    Eraser,
    Font,
    Heading,
    Italic,
    ListOl,
    ListUl,
    QuoteClose,
    Strikethrough,
    Terminal,
    Text,
    TextIndent,
    TextOutdent,
    Underline
} from '@gravity-ui/icons'
import { useTranslation } from 'react-i18next'

/**
 * Ensures consistent toolbar width across different edit modes by matching the WYSIWYG menu size.
 */
export const useToolbarStableWidthProps = () => {
    const { t } = useTranslation()

    const items: MenuItemType[] = useMemo(
        () => [
            {
                icon: <ArrowUturnCcwLeft width={16} height={16} />,
                key: 'Undo',
                title: t('Undo')
            },
            {
                icon: <ArrowUturnCwRight width={16} height={16} />,
                key: 'Redo',
                title: t('Redo')
            },
            {
                type: 'divider'
            },
            {
                icon: <Bold width={16} height={16} />,
                key: 'Bold',
                title: t('Bold')
            },
            {
                icon: <Italic width={16} height={16} />,
                key: 'Italic',
                title: t('Italic')
            },
            {
                icon: <Underline width={16} height={16} />,
                key: 'Underline',
                title: t('Underline')
            },
            {
                icon: <Strikethrough width={16} height={16} />,
                key: 'Strikethrough',
                title: t('Strikethrough')
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
                        title: t('Text')
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 1',
                        title: t('Heading 1')
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 2',
                        title: t('Heading 2')
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 3',
                        title: t('Heading 3')
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 4',
                        title: t('Heading 4')
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 5',
                        title: t('Heading 5')
                    },
                    {
                        icon: <Heading width={16} height={16} />,
                        key: 'Heading 6',
                        title: t('Heading 6')
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
                        title: t('Bullet List')
                    },
                    {
                        icon: <ListOl width={16} height={16} />,
                        key: 'Ordered List',
                        title: t('Ordered List')
                    },
                    {
                        icon: <TextIndent width={16} height={16} />,
                        key: 'Sink Item',
                        title: t('Sink Item')
                    },
                    {
                        icon: <TextOutdent width={16} height={16} />,
                        key: 'Lift Item',
                        title: t('Lift Item')
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
                        title: t('Inline code')
                    },
                    {
                        icon: <Terminal width={16} height={16} />,
                        key: 'Code block',
                        title: t('Code block')
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
                        title: t('Default')
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-gray)" />,
                        key: 'Gray',
                        title: t('Gray')
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-yellow)" />,
                        key: 'Yellow',
                        title: t('Yellow')
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-orange)" />,
                        key: 'Orange',
                        title: t('Orange')
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-red)" />,
                        key: 'Red',
                        title: t('Red')
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-green)" />,
                        key: 'Green',
                        title: t('Green')
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-blue)" />,
                        key: 'Blue',
                        title: t('Blue')
                    },
                    {
                        icon: <Font width={16} height={16} color="var(--colorify-violet)" />,
                        key: 'Violet',
                        title: t('Violet')
                    }
                ]
            },
            {
                icon: <QuoteClose width={16} height={16} />,
                key: 'Quote',
                title: t('Quote')
            },
            {
                type: 'divider'
            },

            {
                icon: <Eraser width={16} height={16} />,
                key: 'Clear Format',
                title: t('Clear Format')
            }
        ],
        [t]
    )

    return {
        items,
        hideMainButtons: true
    }
}
