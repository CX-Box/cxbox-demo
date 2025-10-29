import React, { MouseEventHandler, useCallback } from 'react'
import { icons } from './icons'
import styles from './FileIcon.less'
import cn from 'classnames'
import { isAudioExtension } from '@utils/fileViewer'
import { Icon as AntIcon } from 'antd'

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
    let previewIcon = null
    if (preview) {
        if (type && isAudioExtension(type)) {
            previewIcon = <AntIcon className={cn(styles.preview, styles.audio)} type={'customer-service'} />
        } else {
            const EyeIcon = icons.others.eye
            previewIcon = <EyeIcon className={cn(styles.preview)} />
        }
    }

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
            {previewIcon}
        </span>
    )
}

export default FileIcon
