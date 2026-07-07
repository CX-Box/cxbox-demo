import { Fragment } from 'react'
import MenuItem, { MenuBarItem } from './MenuItem'
import './MenuBar.module.less'
import { EDITOR_TOOLBAR_HEIGHT_RESERVE, EDITOR_TOOLBAR_WIDTH_RESERVE } from '@fields/RichText/constants'

export interface Props {
    items?: MenuBarItem[]
    rightButton: MenuBarItem
    className?: string
    style?: React.CSSProperties
    toolbarDisabled?: boolean
}

export default function MenuBar({ toolbarDisabled, items = [], rightButton, className = '', style = {} }: Props) {
    return (
        <div
            className={`editor__header ${className}`}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: EDITOR_TOOLBAR_HEIGHT_RESERVE,
                ...style
            }}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', minWidth: EDITOR_TOOLBAR_WIDTH_RESERVE }}>
                {items.map((item, idx) => (
                    <Fragment key={idx}>
                        {item.type === 'divider' ? (
                            <div className="divider" />
                        ) : (
                            <MenuItem
                                icon={item.icon!}
                                title={item.title!}
                                action={item.action}
                                isActive={item.isActive ?? false}
                                style={item.style}
                                items={item.items}
                                disabled={toolbarDisabled || item.disabled}
                                groupName={item.groupName}
                            />
                        )}
                    </Fragment>
                ))}
            </div>
            <div style={{ marginLeft: 'auto', paddingRight: '8px' }}>
                <MenuItem
                    icon={rightButton.icon}
                    title={rightButton.title}
                    action={rightButton.action}
                    style={rightButton.style}
                    items={rightButton.items}
                    disabled={toolbarDisabled || rightButton.disabled}
                    hideArrow={true}
                />
            </div>
        </div>
    )
}
