import React from 'react'
import styles from './FileViewerPopup.less'
import Button from '@components/ui/Button/Button'
import { useTranslation } from 'react-i18next'
import { Icon } from 'antd'
import cn from 'classnames'

interface HeaderProps {
    className?: string
    theme?: 'light' | 'dark'
    title?: string
    hint?: string
    onDownload?: () => void
    onClose: () => void
    onFullscreen?: () => void
}

function Header({ className, theme = 'light', title, hint, onFullscreen, onClose, onDownload }: HeaderProps) {
    const { t } = useTranslation()

    return (
        <div className={cn(styles.header, styles[theme], className)}>
            <div className={styles.textBlock}>
                <span className={styles.title}>{title}</span>
                <span className={styles.hint}>{hint}</span>
            </div>
            <div className={styles.operationsBlock}>
                {onFullscreen && (
                    <Button className={styles.button} type="link" icon="fullscreen" onClick={onFullscreen}>
                        {t('Fullscreen')}
                    </Button>
                )}
                <Button className={styles.button} type="link" icon="download" onClick={onDownload}>
                    {t('Download')}
                </Button>
            </div>
            <Icon className={styles.close} type="close" onClick={onClose} />
        </div>
    )
}

export default Header
