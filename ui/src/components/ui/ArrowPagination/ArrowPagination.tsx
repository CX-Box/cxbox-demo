import React from 'react'
import styles from './ArrowPagination.less'
import { useTranslation } from 'react-i18next'
import ArrowButton from '@components/ui/ArrowPagination/ArrowButton'
import cn from 'classnames'

interface ArrowPaginationProps {
    mode?: 'compact' | 'fullscreen' | 'wrapper' | 'image' | 'carouselList'
    onChange: (nextIndex: number, previousIndex: number) => void
    currentIndex: number
    total: string | number
    disabledLeft: boolean
    disabledRight: boolean
    children?: React.ReactNode
    hide?: boolean
    styleWrapper?: React.CSSProperties
}

function ArrowPagination({
    mode = 'compact',
    hide,
    currentIndex,
    onChange,
    total,
    disabledLeft,
    disabledRight,
    children,
    styleWrapper
}: ArrowPaginationProps) {
    const { t } = useTranslation()

    const onPrevious = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault()

        onChange(currentIndex - 1, currentIndex)
    }

    const onNext = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault()

        onChange(currentIndex + 1, currentIndex)
    }

    if (mode === 'carouselList') {
        return hide ? (
            <div style={styleWrapper}>{children}</div>
        ) : (
            <div className={cn(styles[mode])} style={styleWrapper}>
                <ArrowButton className={styles.arrow} type="ghost" icon="left" onClick={onPrevious} disabled={disabledLeft} />
                <ArrowButton className={styles.arrow} type="ghost" icon="right" onClick={onNext} disabled={disabledRight} />

                {children}
            </div>
        )
    }

    if (mode === 'image') {
        return hide ? (
            <div style={styleWrapper}>{children}</div>
        ) : (
            <div className={cn(styles[mode])} style={styleWrapper}>
                <ArrowButton className={styles.arrow} mode="ghost" icon="left" onClick={onPrevious} disabled={disabledLeft} />
                <ArrowButton className={styles.arrow} mode="ghost" icon="right" onClick={onNext} disabled={disabledRight} />
                {children}
            </div>
        )
    }

    if (mode === 'fullscreen') {
        return (
            <div className={cn(styles[mode])} style={styleWrapper}>
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

    if (mode === 'wrapper') {
        return !hide ? (
            <div className={cn(styles[mode])} style={styleWrapper}>
                <ArrowButton className={styles.arrow} icon="left" onClick={onPrevious} disabled={disabledLeft} />
                {children}
                <ArrowButton className={styles.arrow} icon="right" onClick={onNext} disabled={disabledRight} />
            </div>
        ) : null
    }

    return !hide ? (
        <div className={cn(styles[mode])} style={styleWrapper}>
            <ArrowButton className={styles.arrow} icon="left" onClick={onPrevious} disabled={disabledLeft} />
            {t('number of total files', {
                number: currentIndex + 1,
                total: total
            })}
            <ArrowButton className={styles.arrow} icon="right" onClick={onNext} disabled={disabledRight} />
        </div>
    ) : null
}

export default ArrowPagination
