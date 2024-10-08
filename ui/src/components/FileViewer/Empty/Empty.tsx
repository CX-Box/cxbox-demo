import React from 'react'
import styles from './Empty.less'
import FileIcon, { FileIconProps } from '@components/FileViewer/FileIcon/FileIcon'
import cn from 'classnames'

interface EmptyProps extends FileIconProps {
    mode?: 'light' | 'dark'
    width?: number
    height?: number
    text?: string
}

function Empty({ mode = 'light', type, height, width, size, text }: EmptyProps) {
    return (
        <div className={cn(styles.root, styles[mode])} style={{ height, width }}>
            <div className={styles.content}>
                <FileIcon type={type} size={size} />
                {text}
            </div>
        </div>
    )
}

export default Empty
