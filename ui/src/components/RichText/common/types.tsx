import { CSSProperties } from 'react'

export type MenuDivider = {
    type: 'divider'
}

export type MenuActionItem = {
    type?: never
    icon: string
    title: string
    action: () => void
    isActiveName?: string
    isActiveAttrs?: Record<string, unknown>
    style?: CSSProperties
}

export type MenuItemType = MenuDivider | MenuActionItem

export type ViewMode = 'wysiwyg' | 'source'
