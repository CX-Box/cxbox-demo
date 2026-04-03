import './MenuItem.module.less'

import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'
import { Button } from 'antd'

export default function MenuItem({
    icon,
    title,
    action,
    isActive = null
}: {
    icon?: string
    title?: string
    action?: () => void
    isActive?: boolean | null
}) {
    return (
        <Button
            type={isActive ? 'primary' : 'default'}
            className={`menu-item${isActive ? ' is-active' : ''}`}
            onClick={action}
            title={title}
        >
            <svg className="remix">
                <use xlinkHref={`${remixiconUrl}#ri-${icon}`} />
            </svg>
        </Button>
    )
}
