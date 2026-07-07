import React from 'react'
import styles from './PreviewCardLayout.less'
import cn from 'classnames'

interface PreviewCardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    actions?: React.ReactNode
    footer?: React.ReactNode
}

const PreviewCardLayout: React.FC<PreviewCardLayoutProps> = ({ footer, children, actions, ...attr }) => {
    return (
        <div {...attr} className={cn(styles.root, attr.className)}>
            <span className={styles.topActions}>{actions}</span>
            {children}
            <span className={styles.footer}>{footer}</span>
        </div>
    )
}

export default PreviewCardLayout
