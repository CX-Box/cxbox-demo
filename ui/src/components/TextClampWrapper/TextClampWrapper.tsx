import React, { useState, useRef, useCallback, useLayoutEffect } from 'react'
import { Popover } from 'antd'
import styles from './TextClampWrapper.module.less'
import { useResizeObserver } from '@hooks/useResizeObserver'
import cn from 'classnames'
import Button from '@components/ui/Button/Button'
import { useSetCssVariable } from '@hooks/useSetCssVariable'
import { useTranslation } from 'react-i18next'

export interface TextClampWrapperProps {
    children: React.ReactNode
    minRows?: number
    maxRows?: number
    className?: string
    tooltipClassName?: string
    style?: React.CSSProperties
    popoverContent?: React.ReactNode
}

const DEFAULT_MIN_ROWS = 1
const DEFAULT_MAX_ROWS = 3
const DEFAULT_LINE_HEIGHT = 16

const TextClampWrapper: React.FC<TextClampWrapperProps> = ({
    children,
    minRows = DEFAULT_MIN_ROWS,
    maxRows = DEFAULT_MAX_ROWS,
    className,
    tooltipClassName,
    style,
    popoverContent
}) => {
    const { t } = useTranslation()

    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const [lineHeight, setLineHeight] = useState<number>(0)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const [isMeasured, setIsMeasured] = useState(false) // to avoid flickering

    const measureStyles = useCallback(() => {
        const container = containerRef.current
        if (!container) {
            return
        }

        const computed = getComputedStyle(container)
        const lineHeight = parseFloat(computed.lineHeight)
        setLineHeight(isNaN(lineHeight) ? DEFAULT_LINE_HEIGHT : lineHeight)
    }, [])

    // Basic Height Limit Logic
    const applyClamp = useCallback(() => {
        const content = contentRef.current
        const container = containerRef.current
        if (!content || !container || lineHeight === 0) {
            return
        }

        // Resetting styles for fair measurement
        content.style.maxHeight = ''
        content.style.overflow = ''
        // Forced reflow
        void content.offsetHeight

        const fullHeight = content.scrollHeight
        const maxHeight = lineHeight * maxRows
        const minHeight = lineHeight * minRows

        container.style.minHeight = `${minHeight}px`

        const doesContentFit = fullHeight <= maxHeight

        if (doesContentFit) {
            setIsOverflowing(false)
        } else {
            content.style.maxHeight = `${maxHeight}px`
            content.style.overflow = 'hidden'
            setIsOverflowing(true)
        }

        setIsMeasured(true)
    }, [lineHeight, minRows, maxRows])

    useLayoutEffect(() => {
        measureStyles()
    }, [measureStyles])

    useLayoutEffect(() => {
        if (lineHeight > 0) {
            applyClamp()
        }
    }, [lineHeight, applyClamp])

    useResizeObserver(contentRef, () => {
        if (lineHeight > 0) {
            window.requestAnimationFrame(() => {
                applyClamp()
            })
        }
    })

    useSetCssVariable('--clamp-line-height', `${lineHeight}px`, containerRef) // Support for old legacy browsers until 11.2023

    return (
        <div ref={containerRef} className={cn(styles.container, className)} style={style}>
            <div ref={contentRef} className={styles.content} style={{ visibility: isMeasured ? 'visible' : 'hidden' }}>
                {children}
            </div>

            {isOverflowing && (
                <>
                    <div className={styles.gradient} />
                    <Popover
                        content={<div className={styles.popoverContent}>{popoverContent ?? children}</div>}
                        trigger="hover"
                        placement="topLeft"
                        overlayClassName={tooltipClassName}
                    >
                        <Button className={styles.moreButton} type="default" removeIndentation={true} aria-label={t('Show in full')}>
                            ...
                        </Button>
                    </Popover>
                </>
            )}
        </div>
    )
}

export default TextClampWrapper
