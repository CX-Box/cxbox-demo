import React from 'react'
import styles from './ArrowPagination.less'
import { useTranslation } from 'react-i18next'
import ArrowButton from '@components/ui/ArrowPagination/ArrowButton'
import cn from 'classnames'

interface ArrowPaginationProps {
    mode?: 'compact' | 'fullscreen'
    onChange: (index: number) => void
    currentIndex: number
    total: string | number
    disabledLeft: boolean
    disabledRight: boolean
    children?: React.ReactNode
    hide?: boolean
}

function ArrowPagination({
    mode = 'compact',
    hide,
    currentIndex,
    onChange,
    total,
    disabledLeft,
    disabledRight,
    children
}: ArrowPaginationProps) {
    const { t } = useTranslation()

    const onPrevious = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault()

        onChange(currentIndex - 1)
    }

    const onNext = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault()

        onChange(currentIndex + 1)
    }

    if (mode === 'fullscreen') {
        return (
            <div className={cn(styles[mode])}>
                {!hide ? (
                    <>
                        <ArrowButton className={styles.arrow} mode="dark" icon="left" onClick={onPrevious} disabled={disabledLeft} />
                        <ArrowButton className={styles.arrow} mode="dark" icon="right" onClick={onNext} disabled={disabledRight} />
                    </>
                ) : null}
                {children}
            </div>
        )
    }

    return !hide ? (
        <div className={cn(styles[mode])}>
            <ArrowButton icon="left" onClick={onPrevious} disabled={disabledLeft} />
            {t('number of total files', {
                number: currentIndex + 1,
                total: total
            })}
            <ArrowButton icon="right" onClick={onNext} disabled={disabledRight} />
        </div>
    ) : null
}

export default ArrowPagination
