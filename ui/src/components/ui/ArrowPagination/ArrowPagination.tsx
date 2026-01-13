import React, { useCallback } from 'react'
import styles from './ArrowPagination.less'
import { useTranslation } from 'react-i18next'
import ArrowButton, { ArrowButtonProps } from '@components/ui/ArrowPagination/ArrowButton'
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

    const onPrevious = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault()
            onChange(currentIndex - 1, currentIndex)
        },
        [currentIndex, onChange]
    )

    const onNext = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault()
            onChange(currentIndex + 1, currentIndex)
        },
        [currentIndex, onChange]
    )

    const renderArrows = (mode: ArrowButtonProps['mode'], content?: React.ReactNode) => (
        <>
            <ArrowButton className={styles.arrow} icon="left" onClick={onPrevious} disabled={disabledLeft} mode={mode} />
            {content}
            <ArrowButton className={styles.arrow} icon="right" onClick={onNext} disabled={disabledRight} mode={mode} />
        </>
    )

    const contentElement = <React.Fragment key="arrow-pagination-content">{children}</React.Fragment>

    switch (mode) {
        case 'image':
        case 'carouselList': {
            if (hide) {
                return <div style={styleWrapper}>{contentElement}</div>
            }

            return (
                <div className={cn(styles[mode])} style={styleWrapper}>
                    {renderArrows('ghost')}
                    {contentElement}
                </div>
            )
        }

        case 'fullscreen': {
            return (
                <div className={cn(styles[mode])} style={styleWrapper}>
                    {!hide ? renderArrows('dark') : null}
                    {contentElement}
                </div>
            )
        }

        case 'wrapper': {
            if (hide) {
                return null
            }

            return (
                <div className={cn(styles[mode])} style={styleWrapper}>
                    {renderArrows('light', contentElement)}
                </div>
            )
        }

        case 'compact':
        default: {
            if (hide) {
                return null
            }

            const content = t('number of total', {
                number: currentIndex + 1,
                total: total
            })

            return (
                <div className={cn(styles[mode])} style={styleWrapper}>
                    {renderArrows('light', content)}
                </div>
            )
        }
    }
}

export default React.memo(ArrowPagination)
