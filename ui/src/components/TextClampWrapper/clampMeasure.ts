import { batch } from 'react-redux'

/**
 * A text block with a row limit, as TextClampWrapper registers it for measuring.
 */
export interface ClampCell {
    container: HTMLElement
    content: HTMLElement
    minRows: number
    maxRows: number
    measured: boolean
    setOverflowing: (overflowing: boolean) => void
}

const DEFAULT_LINE_HEIGHT = 16

// Cells are measured in batches, not in their own layout effects: React runs the layout effects of a list one by one,
// mixed with the writes of other components, and a read after any write makes the browser lay out the page again.
// A batch reads all its cells after the commit, so a list costs one layout instead of one per cell.
const beforePaint = new Set<ClampCell>()
const nextFrame = new Set<ClampCell>()

/**
 * An equal value is not written again: a remeasure of an unchanged cell then causes no new layout.
 */
const setStyle = (element: HTMLElement, property: string, value: string) => {
    if (element.style.getPropertyValue(property) !== value) {
        element.style.setProperty(property, value)
    }
}

/**
 * Measures a batch of cells: first all reads, then all writes, then one render for the cells whose state changes.
 */
const flush = (batchOfCells: Set<ClampCell>) => {
    const cells = Array.from(batchOfCells).filter(cell => cell.content.isConnected)
    batchOfCells.clear()
    const sizes = cells.map(cell => {
        const lineHeight = parseFloat(getComputedStyle(cell.container).lineHeight)
        return { lineHeight: isNaN(lineHeight) ? DEFAULT_LINE_HEIGHT : lineHeight, fullHeight: cell.content.scrollHeight }
    })
    const overflowing = cells.map((cell, index) => {
        const { lineHeight, fullHeight } = sizes[index]
        const maxHeight = lineHeight * cell.maxRows
        const fits = fullHeight <= maxHeight
        setStyle(cell.container, 'min-height', `${lineHeight * cell.minRows}px`)
        // Support for old legacy browsers until 11.2023: the button height without the lh unit
        setStyle(cell.container, '--clamp-line-height', `${lineHeight}px`)
        setStyle(cell.content, 'max-height', fits ? '' : `${maxHeight}px`)
        setStyle(cell.content, 'overflow', fits ? '' : 'hidden')
        setStyle(cell.content, 'visibility', 'visible')
        cell.measured = true
        return !fits
    })
    batch(() => cells.forEach((cell, index) => cell.setOverflowing(overflowing[index])))
}

/**
 * Measures a new cell before the browser paints; until then it is hidden, to avoid flickering.
 * The microtask runs after the current task with all its React commits, before the paint.
 */
export const measureBeforePaint = (cell: ClampCell) => {
    if (!cell.measured) {
        setStyle(cell.content, 'visibility', 'hidden')
    }
    if (beforePaint.size === 0) {
        Promise.resolve().then(() => flush(beforePaint))
    }
    beforePaint.add(cell)
}

/**
 * Measures a resized cell in the next frame, together with the other cells resized in the same frame.
 * Not in the ResizeObserver callback itself: a write there can resize the observed element again.
 */
export const measureNextFrame = (cell: ClampCell) => {
    if (nextFrame.size === 0) {
        window.requestAnimationFrame(() => flush(nextFrame))
    }
    nextFrame.add(cell)
}

export const cancelMeasure = (cell: ClampCell) => {
    beforePaint.delete(cell)
    nextFrame.delete(cell)
}
