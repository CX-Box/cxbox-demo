import styles from './MenuItem.module.less'
import { Dropdown, Menu } from 'antd'
import { MenuActionItem } from '@components/RichText/common/types'
import React from 'react'
import Button from '@components/ui/Button/Button'
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
            style={{ flexShrink: 0, ...style }}
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
        const getSelectedKeys = (currentItems: MenuBarItem[], prefix = ''): string[] => {
            let keys: string[] = []
            currentItems.forEach((subItem, index) => {
                const key = prefix ? `${prefix}-${index}` : String(index)
                if (subItem.isActive) {
                    keys.push(key)
                }
                if (subItem.items) {
                    keys = keys.concat(getSelectedKeys(subItem.items, key))
                }
            })
            return keys
        }

        const selectedKeys = getSelectedKeys(items)

        const renderMenuContent = (currentItems: MenuBarItem[], prefix = '') => {
            return currentItems.map((subItem, index) => {
                const key = prefix ? `${prefix}-${index}` : String(index)

                if (subItem.type === 'divider') {
                    return <Menu.Divider key={key} />
                }

                const itemContent = (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {subItem.icon && (
                            <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {subItem.icon}
                            </span>
                        )}
                        <span>{subItem.title}</span>
                    </div>
                )

                if (subItem.items && subItem.items.length > 0) {
                    const subMenuChildren = renderMenuContent(subItem.items, key)

                    return (
                        <Menu.SubMenu key={key} title={itemContent} disabled={subItem.disabled}>
                            {subItem.groupName ? (
                                <Menu.ItemGroup title={subItem.groupName}>{subMenuChildren}</Menu.ItemGroup>
                            ) : (
                                subMenuChildren
                            )}
                        </Menu.SubMenu>
                    )
                }

                return (
                    <Menu.Item key={key} onClick={subItem.action} title={subItem.title} disabled={subItem.disabled}>
                        {itemContent}
                    </Menu.Item>
                )
            })
        }

        const menuContent = renderMenuContent(items)

        const menu = (
            <Menu selectedKeys={selectedKeys}>
                {groupName ? (
                    <Menu.ItemGroup title={groupName} className={styles.itemGroup}>
                        {menuContent}
                    </Menu.ItemGroup>
                ) : (
                    menuContent
                )}
            </Menu>
        )

        return (
            <Dropdown
                overlay={menu}
                trigger={['click']}
                placement="bottomLeft"
                disabled={disabled}
                overlayClassName={styles.dropdown}
                overlayStyle={{ flexShrink: 0 }}
            >
                {button}
            </Dropdown>
        )
    }

    return button
}
