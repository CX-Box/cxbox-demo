import styles from './MenuItem.module.less'
import { Dropdown, Menu } from 'antd'
import { MenuActionItem } from '@components/RichText/common/types'
import React from 'react'
import Button from '@components/ui/Button/Button'
import { isDefined } from '@utils/isDefined'
import { ChevronDown } from '@gravity-ui/icons'

export interface MenuBarItem extends Partial<Omit<MenuActionItem, 'type' | 'action' | 'items' | 'icon'>> {
    type?: 'divider' | string
    action?: () => void
    isActive?: boolean
    items?: MenuBarItem[]
    icon?: React.ReactNode
    disabled?: boolean
}

export interface MenuItemProps {
    icon?: React.ReactNode
    title?: string
    action?: () => void
    isActive?: boolean | null
    style?: React.CSSProperties
    groupName?: string
    items?: MenuBarItem[]
    hideArrow?: boolean
    disabled?: boolean
}

export default function MenuItem({ icon, title, action, isActive = null, style, items, hideArrow, groupName, disabled }: MenuItemProps) {
    const hasItems = items && items.length > 0

    const button = (
        <Button
            type={isActive ? 'mdToolbarButtonPrimary' : 'mdToolbarButton'}
            className={`menu-item`}
            style={style}
            onClick={action}
            disabled={disabled}
            onMouseDown={e => {
                if (!hasItems) {
                    e.preventDefault()
                }
            }}
            title={title}
        >
            {icon}
            {!icon && title && <span>{title}</span>}
            {hasItems && !hideArrow ? <ChevronDown height={16} /> : null}
        </Button>
    )

    if (hasItems) {
        const selectedKeys = items?.map((subItem, index) => (subItem.isActive ? String(index) : null)).filter(isDefined)
        const menuItems = items.map((subItem, index) => (
            <Menu.Item key={String(index)} onClick={subItem.action} title={subItem.title} disabled={subItem.disabled}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {subItem.icon && <span style={{ width: 16, height: 16, display: 'flex' }}>{subItem.icon}</span>}
                    <span>{subItem.title}</span>
                </div>
            </Menu.Item>
        ))

        const menu = (
            <Menu selectedKeys={selectedKeys}>
                {groupName ? (
                    <Menu.ItemGroup title={groupName} className={styles.itemGroup}>
                        {menuItems}
                    </Menu.ItemGroup>
                ) : (
                    menuItems
                )}
            </Menu>
        )

        return (
            <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft" disabled={disabled}>
                {button}
            </Dropdown>
        )
    }

    return button
}
