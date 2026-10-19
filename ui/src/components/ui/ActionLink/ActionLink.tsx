import React from 'react'
import cn from 'classnames'
import styles from './ActionLink.less'

export interface IActionLinkProps {
    className?: string
    children?: React.ReactNode
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
    style?: React.CSSProperties
    [testMark: `data-test-${string}`]: boolean | string | undefined
}

/**
 *
 * @param props
 * @category Components
 */
const ActionLink: React.FC<IActionLinkProps> = ({ className, style, children, onClick, ...testMarks }) => {
    const handleClick = React.useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault()
            e.stopPropagation()
            onClick?.(e)
        },
        [onClick]
    )
    return (
        <a className={cn(styles.ActionLink, className)} style={style} onClick={handleClick} {...testMarks}>
            {children}
        </a>
    )
}

export default React.memo(ActionLink)
