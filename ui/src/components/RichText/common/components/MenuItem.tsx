import './MenuItem.module.less'
import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'
import { Button } from 'antd'

export default function MenuItem({
    icon,
    title,
    action,
    isActive = null,
    style
}: {
    icon?: string
    title?: string
    action?: () => void
    isActive?: boolean | null
    style?: React.CSSProperties
}) {
    return (
        <Button
            type={isActive ? 'primary' : 'default'}
            className={`menu-item`}
            style={style}
            onClick={action}
            onMouseDown={e => {
                e.preventDefault()
            }}
            title={title}
        >
            <svg className="remix">
                <use xlinkHref={`${remixiconUrl}#ri-${icon}`} />
            </svg>
        </Button>
    )
}
