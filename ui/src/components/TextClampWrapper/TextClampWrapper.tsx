import React, { useState, useRef, useLayoutEffect } from 'react'
import { Popover } from 'antd'
import styles from './TextClampWrapper.module.less'
import { useResizeObserver } from '@hooks/useResizeObserver'
import cn from 'classnames'
import Button from '@components/ui/Button/Button'
import { useTranslation } from 'react-i18next'
import { cancelMeasure, ClampCell, measureBeforePaint, measureNextFrame } from './clampMeasure'

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

    const cellRef = useRef<ClampCell>()

    const [isOverflowing, setIsOverflowing] = useState(false)

    // Basic Height Limit Logic: the cells of one render are measured together, see clampMeasure
    useLayoutEffect(() => {
        const container = containerRef.current
        const content = contentRef.current
        if (!container || !content) {
            return
        }

        const cell: ClampCell = {
            container,
            content,
            minRows,
            maxRows,
            measured: cellRef.current?.measured ?? false,
            setOverflowing: setIsOverflowing
        }
        cellRef.current = cell
        measureBeforePaint(cell)

        return () => cancelMeasure(cell)
    }, [minRows, maxRows])

    useResizeObserver(contentRef, () => {
        if (cellRef.current) {
            measureNextFrame(cellRef.current)
        }
    })

    return (
        <div ref={containerRef} className={cn(styles.container, className)} style={style}>
            <div ref={contentRef} className={styles.content}>
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
