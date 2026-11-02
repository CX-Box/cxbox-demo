import React, { ReactNode } from 'react'
import styles from './Header.less'
import Button from '@components/ui/Button/Button'
import { useTranslation } from 'react-i18next'
import { Icon } from 'antd'
import cn from 'classnames'

export interface HeaderOperation {
    icon?: string
    onClick?: () => void
    /** visible label (translation key); omit → icon only */
    label?: string
    /** tooltip */
    title?: string
    removeIndentation?: boolean
    /**
     * Full custom node (e.g. `<Upload><Button/></Upload>`). When set it is rendered instead of the
     * default link button, so composite triggers can live in the operations row.
     */
    node?: ReactNode
}

export interface HeaderProps {
    className?: string
    theme?: 'light' | 'dark'
    title?: string
    hint?: string
    hideIfEmpty?: boolean
    onClose?: () => void
    center?: ReactNode
    operations?: HeaderOperation[]
}

function Header({ className, theme = 'light', title, hint, onClose, center, operations, hideIfEmpty }: HeaderProps) {
    const { t } = useTranslation()

    if (hideIfEmpty && !(title || hint || operations?.length || center || onClose)) {
        return null
    }

    return (
        <div className={cn(styles.header, styles[theme], className, { [styles.hasCenter]: !!center })}>
            <div className={styles.textBlock}>
                <span className={cn(styles.title, styles.ellipsis)} title={title}>
                    {title}
                </span>
                {hint && (
                    <span className={styles.hint} title={hint}>
                        {hint}
                    </span>
                )}
            </div>

            {center && <div className={styles.centerBlock}>{center}</div>}

            <div className={styles.operationsBlock}>
                {operations?.map((op, i) => (
                    <React.Fragment key={i}>
                        {op.node ?? (
                            <Button
                                className={styles.button}
                                type="link"
                                removeIndentation={op.removeIndentation}
                                icon={op.icon}
                                onClick={op.onClick}
                                title={op.title}
                            >
                                {op.label ? t(op.label) : undefined}
                            </Button>
                        )}
                    </React.Fragment>
                ))}
                {onClose && <Icon className={styles.close} type="close" onClick={onClose} />}
            </div>
        </div>
    )
}

export default Header
