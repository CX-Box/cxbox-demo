import React, { ReactNode } from 'react'
import styles from './Header.module.less'
import Button from '@components/ui/Button/Button'
import { useTranslation } from 'react-i18next'
import { Icon } from 'antd'
import cn from 'classnames'

export interface HeaderProps {
    className?: string
    theme?: 'light' | 'dark'
    title?: string
    hint?: string
    onDownload?: () => void
    onClose?: () => void
    onFullscreen?: () => void
    center?: ReactNode
}

function Header({ className, theme = 'light', title, hint, onFullscreen, onClose, onDownload, center }: HeaderProps) {
    const { t } = useTranslation()

    return (
        <div className={cn(styles.header, styles[theme], className, { [styles.hasCenter]: !!center })}>
            <div className={styles.textBlock}>
                <span className={styles.title}>{title}</span>
                <span className={styles.hint}>{hint}</span>
            </div>
            {center && <div className={styles.centerBlock}>{center}</div>}
            <div className={styles.operationsBlock}>
                {onFullscreen && (
                    <Button className={styles.button} type="link" icon="fullscreen" onClick={onFullscreen}>
                        {t('Fullscreen')}
                    </Button>
                )}
                <Button className={styles.button} type="link" icon="download" onClick={onDownload}>
                    {t('Download')}
                </Button>
                {onClose && <Icon className={styles.close} type="close" onClick={onClose} />}
            </div>
        </div>
    )
}

export default Header
