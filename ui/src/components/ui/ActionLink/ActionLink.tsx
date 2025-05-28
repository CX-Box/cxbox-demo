import React from 'react'
import cn from 'classnames'
import styles from './ActionLink.less'

export interface IActionLinkProps {
    className?: string
    children?: React.ReactNode
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

/**
 *
 * @param props
 * @category Components
 */
const ActionLink: React.FC<IActionLinkProps> = ({ className, children, onClick }) => {
    const handleClick = React.useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault()
            e.stopPropagation()
            if (onClick) {
                onClick(e)
            }
        },
        [onClick]
    )
    return (
        <a className={cn(styles.ActionLink, className)} onClick={handleClick}>
            {children}
        </a>
    )
}

/**
 * @category Components
 */
const MemoizedActionLink = React.memo(ActionLink)

export default MemoizedActionLink
