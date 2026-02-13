import React from 'react'
import styles from './FullscreenLayout.less'

interface FullscreenLayoutProps {
    title: React.ReactNode
    content: React.ReactNode
    visible?: boolean
}

function FullscreenLayout({ title, content, visible }: FullscreenLayoutProps) {
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

export default React.memo(FullscreenLayout)
