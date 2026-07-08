import React, { useState, useRef, useLayoutEffect, useCallback, Fragment } from 'react'
import { MenuBarItem } from './MenuItem'
import { useDebouncedWidthResize } from '@hooks/useDebouncedWidthResize'
import styles from './ToolbarOverflowWrapper.module.less'

export interface ToolbarOverflowWrapperProps {
    items: MenuBarItem[]
    renderItem: (item: MenuBarItem) => React.ReactNode
    renderMoreButton: (hiddenItems: MenuBarItem[]) => React.ReactNode
    height?: number
}

const ToolbarOverflowWrapper: React.FC<ToolbarOverflowWrapperProps> = ({ items, renderItem, renderMoreButton, height }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const measureRef = useRef<HTMLDivElement>(null)
    const [visibleCount, setVisibleCount] = useState<number>(items.length)

    const calculateOverflow = useCallback(() => {
        if (!containerRef.current || !measureRef.current || items.length === 0) {
            return
        }

        const containerWidth = containerRef.current.getBoundingClientRect().width

        const measureContainerRect = measureRef.current.getBoundingClientRect()
        const measureChildren = Array.from(measureRef.current.children) as HTMLElement[]
        const childrenCount = measureChildren.length

        if (childrenCount <= 1) {
            return
        }

        const moreButton = measureChildren[childrenCount - 1]
        const moreBtnWidth = moreButton.getBoundingClientRect().width

        let gap = 0
        if (childrenCount > 2) {
            const firstRect = measureChildren[0].getBoundingClientRect()
            const secondRect = measureChildren[1].getBoundingClientRect()
            gap = secondRect.left - firstRect.right
        }

        const lastItem = measureChildren[childrenCount - 2]
        const totalWidthWithoutMoreBtn = lastItem.getBoundingClientRect().right - measureContainerRect.left

        if (totalWidthWithoutMoreBtn <= containerWidth + 0.5) {
            window.requestAnimationFrame(() => {
                setVisibleCount(prev => (prev !== items.length ? items.length : prev))
            })
            return
        }

        let count = 0
        for (let i = 0; i < childrenCount - 1; i++) {
            const childRect = measureChildren[i].getBoundingClientRect()
            const childRightEdge = childRect.right - measureContainerRect.left

            if (childRightEdge + gap + moreBtnWidth > containerWidth) {
                break
            }
            count++
        }

        setVisibleCount(prev => (prev !== count ? count : prev))
    }, [items.length])

    useLayoutEffect(() => {
        calculateOverflow()
    }, [calculateOverflow, items])

    useDebouncedWidthResize(containerRef, calculateOverflow, 300)

    useDebouncedWidthResize(measureRef, calculateOverflow, 300)

    const { visibleItems, hiddenItems } = React.useMemo(
        () => ({
            visibleItems: items.slice(0, visibleCount),
            hiddenItems: items.slice(visibleCount)
        }),
        [items, visibleCount]
    )

    const renderMenuItems = useCallback(
        (itemsToRender: MenuBarItem[], keyPrefix: string) => {
            return itemsToRender.map((item, idx) => <Fragment key={`${keyPrefix}-${idx}`}>{renderItem(item)}</Fragment>)
        },
        [renderItem]
    )

    const measureBlock = React.useMemo(
        () => (
            <div ref={measureRef} className={styles.measureBlock} aria-hidden="true">
                {renderMenuItems(items, 'measure')}
                {renderMoreButton([])}
            </div>
        ),
        [items, renderMenuItems, renderMoreButton]
    )

    return (
        <div ref={containerRef} className={styles.container} style={{ height }}>
            {renderMenuItems(visibleItems, 'visible')}

            {hiddenItems.length > 0 && renderMoreButton(hiddenItems)}

            {measureBlock}
        </div>
    )
}

export default React.memo(ToolbarOverflowWrapper)
