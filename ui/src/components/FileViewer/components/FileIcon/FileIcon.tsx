import React, { MouseEventHandler, useCallback } from 'react'
import { icons } from './icons'
import styles from './FileIcon.less'
import cn from 'classnames'
import { isAudioExtension } from '@utils/fileViewer'
import PreviewIcon from '@components/FileViewer/components/PreviewIcon/PreviewIcon'

export interface FileIconProps {
    className?: string
    size?: 'big' | 'small'
    type?: keyof typeof icons.small | keyof typeof icons.full | string
    onClick?: MouseEventHandler<HTMLSpanElement>
    preview?: boolean
    hoverEnabled?: boolean
}

function FileIcon({ className, size = 'small', type, onClick, preview, hoverEnabled }: FileIconProps) {
    const currentIcons = size === 'small' ? icons.small : icons.full
    const Icon = currentIcons[type?.toLowerCase() as keyof typeof currentIcons] ?? currentIcons.file

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
            {preview ? (
                <PreviewIcon type={type} className={cn(styles.preview, { [styles.audio]: type && isAudioExtension(type) })} />
            ) : null}
        </span>
    )
}

export default FileIcon
