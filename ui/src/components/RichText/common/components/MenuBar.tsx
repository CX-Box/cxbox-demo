import React, { useCallback } from 'react'
import MenuItem, { MenuBarItem } from './MenuItem'
import './MenuBar.module.less'
import ToolbarOverflowWrapper from './ToolbarOverflowWrapper'
import { Icon } from 'antd'
import cn from 'classnames'

export interface Props {
    items?: MenuBarItem[]
    rightButton: MenuBarItem
    className?: string
    style?: React.CSSProperties
    toolbarDisabled?: boolean
    settingDisabled?: boolean
    hideMainButtons?: boolean
}

export default function MenuBar({
    toolbarDisabled,
    settingDisabled,
    items = [],
    rightButton,
    className = '',
    style = {},
    hideMainButtons
}: Props) {
    const renderItem = useCallback(
        item => {
            if (item.type === 'divider') {
                return <div className="divider" />
            }
            return (
                <MenuItem
                    icon={item.icon}
                    title={item.title}
                    style={item.style}
                    isActive={item.isActive ?? false}
                    items={item.items}
                    groupName={item.groupName}
                    action={item.action}
                    disabled={toolbarDisabled || item.disabled}
                    actionKey={item.key}
                />
            )
        },
        [toolbarDisabled]
    )

    const renderMoreButton = useCallback(
        hiddenItems => (
            <MenuItem
                icon={<Icon type="ellipsis" />}
                hideArrow={true}
                items={hiddenItems.length > 0 ? hiddenItems : undefined}
                disabled={toolbarDisabled || hiddenItems.length === 0}
                actionKey="More"
            />
        ),
        [toolbarDisabled]
    )

    // The toolbar never takes the focus from the text: a click on a button or on a menu item (the menus are React children
    // of the toolbar, so their events come here too) is not leaving the field, and the selection in the text stays.
    const keepFocusInText = useCallback((event: React.MouseEvent) => event.preventDefault(), [])

    return (
        <div className={cn('editor__header', className)} style={style} onMouseDown={keepFocusInText}>
            <ToolbarOverflowWrapper
                items={items}
                renderItem={renderItem}
                renderMoreButton={renderMoreButton}
                height={hideMainButtons ? 0 : undefined}
            />

            <div className="editor__rightButton">
                <MenuItem
                    icon={rightButton.icon}
                    title={rightButton.title}
                    action={rightButton.action}
                    style={rightButton.style}
                    items={rightButton.items}
                    disabled={(settingDisabled ?? toolbarDisabled) || rightButton.disabled}
                    hideArrow={true}
                    actionKey={rightButton.key}
                />
            </div>
        </div>
    )
}
