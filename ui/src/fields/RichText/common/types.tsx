import { CSSProperties } from 'react'

export type MenuDivider = {
    type: 'divider'
}

export type MenuActionItem = {
    key: string
    type?: never
    icon: React.ReactNode
    title: string
    action?: () => void
    isActiveName?: string
    isActiveAttrs?: Record<string, unknown>
    style?: CSSProperties
    groupName?: string
    items?: MenuActionItem[]
}

export type MenuItemType = MenuDivider | MenuActionItem

export type ViewMode = 'wysiwyg' | 'source'
