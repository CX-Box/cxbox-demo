import React from 'react'
import styles from './FullscreenFileViewer.less'

interface FullscreenFileViewerProps {
    title: React.ReactNode
    content: React.ReactNode
    visible?: boolean
}

function FullscreenFileViewer({ title, content, visible }: FullscreenFileViewerProps) {
    if (!visible) {
        return null
    }

    return (
        <div className={styles.root}>
            <div className={styles.header}>{title}</div>
            <div className={styles.content}>{content}</div>
        </div>
    )
}

export default React.memo(FullscreenFileViewer)
