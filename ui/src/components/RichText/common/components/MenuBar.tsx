import { Fragment } from 'react'
import MenuItem from './MenuItem'
import './MenuBar.module.less'
import { MenuActionItem } from '@components/RichText/common/types'

export interface MenuBarItem extends Partial<Omit<MenuActionItem, 'type' | 'action'>> {
    type?: 'divider' | string
    action?: () => void
    isActive?: boolean
}

export interface Props {
    items?: MenuBarItem[]
    rightButton: MenuBarItem
    className?: string
    style?: React.CSSProperties
}

export default function MenuBar({ items = [], rightButton, className = '', style = {} }: Props) {
    return (
        <div
            className={`editor__header ${className}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...style }}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
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
                            />
                        )}
                    </Fragment>
                ))}
            </div>
            <div style={{ marginLeft: 'auto', paddingRight: '8px' }}>
                <MenuItem icon={rightButton.icon} title={rightButton.title} action={rightButton.action} style={rightButton.style} />
            </div>
        </div>
    )
}
