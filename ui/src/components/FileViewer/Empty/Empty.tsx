import React from 'react'
import styles from './Empty.less'
import FileIcon, { FileIconProps } from '@components/FileViewer/FileIcon/FileIcon'
import cn from 'classnames'

interface EmptyProps extends FileIconProps {
    mode?: 'light' | 'dark'
    width?: number
    height?: number
    text?: string
    iconOnly?: boolean
}

function Empty({ mode = 'light', type, height, width, size, text, iconOnly }: EmptyProps) {
    return (
        <div className={cn(styles.root, styles[mode], { [styles.iconOnly]: iconOnly })} style={{ height, width }}>
            <div className={styles.content}>
                <FileIcon type={type} size={size} />
                {!iconOnly && text}
            </div>
        </div>
    )
}

export default Empty
