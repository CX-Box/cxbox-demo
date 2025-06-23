import React, { MouseEventHandler, useCallback } from 'react'
import { icons } from './icons'
import styles from './FileIcon.less'
import cn from 'classnames'

export interface FileIconProps {
    className?: string
    size?: 'big' | 'small'
    type?: keyof typeof icons.small | keyof typeof icons.full | string
    onClick?: MouseEventHandler<HTMLSpanElement>
    eye?: boolean
    hoverEnabled?: boolean
}

function FileIcon({ className, size = 'small', type, onClick, eye, hoverEnabled }: FileIconProps) {
    const currentIcons = size === 'small' ? icons.small : icons.full
    const Icon = currentIcons[type?.toLowerCase() as keyof typeof currentIcons] ?? currentIcons.file
    const EyeIcon = icons.others.eye

    const handleClick = useCallback<MouseEventHandler<HTMLSpanElement>>(
        e => {
            e.stopPropagation()
            onClick && onClick(e)
        },
        [onClick]
    )

    return (
        <span className={cn(className, styles.root, { [styles.hoverEnabled]: hoverEnabled ?? !!onClick })} onClick={handleClick}>
            <Icon className={cn(styles.main)} />
            {eye ? <EyeIcon className={cn(styles.eye)} /> : null}
        </span>
    )
}

export default FileIcon
